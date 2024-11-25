import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

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

type OrderDetailsProps = {
    order: Order;
    onClose: () => void;
};

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
    const totalPrice = order.orderItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Детали заказа</DialogTitle>
                    <DialogDescription>
                        ID заказа: {order.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold">Клиент:</span>
                        <span className="col-span-3">{order.customerName}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold">Адрес:</span>
                        <span className="col-span-3">{order.deliveryAddress}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold">Дата:</span>
                        <span className="col-span-3">{new Date(order.orderDate).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-bold">Статус:</span>
                        <span className="col-span-3">{order.status}</span>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Товар</TableHead>
                            <TableHead>Количество</TableHead>
                            <TableHead>Цена</TableHead>
                            <TableHead>Итого</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.orderItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.product.price.toFixed(2)} ₽</TableCell>
                                <TableCell>{(item.quantity * item.product.price).toFixed(2)} ₽</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <DialogFooter>
                    <div className="flex justify-between items-center w-full">
                        <span className="font-bold">Общая сумма: {totalPrice.toFixed(2)} ₽</span>
                        <Button onClick={onClose}>Закрыть</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

