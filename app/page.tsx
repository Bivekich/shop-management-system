import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddProduct from "@/components/AddProduct"
import CreateOrder from "@/components/CreateOrder"
import ViewOrders from "@/components/ViewOrders"
import Dashboard from "@/components/Dashboard"
import DiscountManager from "@/components/DiscountManager"
import { getDashboardData } from "@/lib/api"

export default async function Home() {
    const initialDashboardData = await getDashboardData()

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-center">Система управления магазином</h1>
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard">Панель управления</TabsTrigger>
                    <TabsTrigger value="add-product">Добавить товар</TabsTrigger>
                    <TabsTrigger value="create-order">Создать заказ</TabsTrigger>
                    <TabsTrigger value="view-orders">Просмотр заказов</TabsTrigger>
                    <TabsTrigger value="discounts">Управление скидками</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                    <Dashboard initialData={initialDashboardData} />
                </TabsContent>
                <TabsContent value="add-product">
                    <AddProduct />
                </TabsContent>
                <TabsContent value="create-order">
                    <CreateOrder />
                </TabsContent>
                <TabsContent value="view-orders">
                    <ViewOrders />
                </TabsContent>
                <TabsContent value="discounts">
                    <DiscountManager />
                </TabsContent>
            </Tabs>
        </div>
    )
}

