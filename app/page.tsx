import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddProduct from "@/components/AddProduct"
import CreateOrder from "@/components/CreateOrder"
import ViewOrders from "@/components/ViewOrders"

export default function Home() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-center">Система управления магазином</h1>
            <Tabs defaultValue="add-product" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="add-product">Добавить товар</TabsTrigger>
                    <TabsTrigger value="create-order">Создать заказ</TabsTrigger>
                    <TabsTrigger value="view-orders">Просмотр заказов</TabsTrigger>
                </TabsList>
                <TabsContent value="add-product">
                    <AddProduct />
                </TabsContent>
                <TabsContent value="create-order">
                    <CreateOrder />
                </TabsContent>
                <TabsContent value="view-orders">
                    <ViewOrders />
                </TabsContent>
            </Tabs>
        </div>
    )
}
