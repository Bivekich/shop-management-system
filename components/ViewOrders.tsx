"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import OrderDetails from "./OrderDetails"

type OrderItem = {
    id: number;
    productId: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
    };
};

type Discount = {
    id: number;
    name: string;
    type: string;
    value: number;
};

type Order = {
    id: number;
    customerName: string;
    deliveryAddress: string;
    orderDate: string;
    status: string;
    orderItems: OrderItem[];
    discount: Discount | null;
};

export default function ViewOrders() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])

    const translateStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            PENDING: "Ожидает",
            PROCESSING: "Обрабатывается",
            SHIPPED: "Отправлен",
            DELIVERED: "Доставлен",
            CANCELLED: "Отменен"
        };
        return statusMap[status] || status;
    };

    const sortOrdersByDate = (a: Order, b: Order) => {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    };

    const { data: orders, isLoading, error } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await fetch("/api/orders")
            if (!response.ok) {
                throw new Error("Не удалось загрузить заказы")
            }
            return response.json()
        }
    })

    useEffect(() => {
        if (orders) {
            setFilteredOrders(
                orders
                    .filter((order) => {
                        const matchesSearch =
                            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.id.toString().includes(searchTerm);
                        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
                        return matchesSearch && matchesStatus;
                    })
                    .sort(sortOrdersByDate)
            );
        }
    }, [orders, searchTerm, statusFilter]);

    if (isLoading) return <div>Загрузка...</div>
    if (error) return <div>Ошибка при загрузке заказов</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Поиск по имени клиента или ID заказа"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Фильтр по статусу" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Все статусы</SelectItem>
                        <SelectItem value="PENDING">Ожидает</SelectItem>
                        <SelectItem value="PROCESSING">Обрабатывается</SelectItem>
                        <SelectItem value="SHIPPED">Отправлен</SelectItem>
                        <SelectItem value="DELIVERED">Доставлен</SelectItem>
                        <SelectItem value="CANCELLED">Отменен</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableCaption>Список заказов</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID заказа</TableHead>
                        <TableHead>Имя клиента</TableHead>
                        <TableHead>Адрес доставки</TableHead>
                        <TableHead>Дата заказа</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Кол-во товаров</TableHead>
                        <TableHead>Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">Заказы не найдены</TableCell>
                        </TableRow>
                    ) : (
                        filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{order.deliveryAddress}</TableCell>
                                <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge>{translateStatus(order.status)}</Badge>
                                </TableCell>
                                <TableCell>{order.orderItems.length}</TableCell>
                                <TableCell>
                                    <Button onClick={() => setSelectedOrder(order)}>Подробнее</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {selectedOrder && (
                <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    )
}

