"use client"

import { useState } from "react"
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

type Order = {
    id: number;
    customerName: string;
    deliveryAddress: string;
    orderDate: string;
    status: string;
    orderItems: OrderItem[];
};

export default function ViewOrders() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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

    if (isLoading) return <div>Загрузка...</div>
    if (error) return <div>Ошибка при загрузке заказов</div>

    return (
        <>
            <Table>
                <TableCaption>Список последних заказов.</TableCaption>
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
                    {!orders && <TableRow><TableCell colSpan={7}>Заказы не найдены</TableCell></TableRow>}
                    {orders?.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.deliveryAddress}</TableCell>
                            <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                            <TableCell>
                                <Badge>{order.status}</Badge>
                            </TableCell>
                            <TableCell>{order.orderItems.length}</TableCell>
                            <TableCell>
                                <Button onClick={() => setSelectedOrder(order)}>Подробнее</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {selectedOrder && (
                <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </>
    )
}
