'use client'

import { useQuery } from "@tanstack/react-query"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import SalesAnalytics from './SalesAnalytics'
import {Button} from "@/components/ui/button";

type DashboardData = {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    popularProducts: Array<{ name: string; sales: number }>
}

const CACHE_KEY = 'dashboardData'
const CACHE_TIME = 5 * 60 * 1000 // 5 minutes in milliseconds

export default function Dashboard({ initialData }: { initialData: DashboardData }) {
    const [isCacheValid, setIsCacheValid] = useState(false)

    useEffect(() => {
        const cachedData = localStorage.getItem(CACHE_KEY)
        if (cachedData) {
            const { timestamp } = JSON.parse(cachedData)
            if (Date.now() - timestamp < CACHE_TIME) {
                setIsCacheValid(true)
            }
        }
    }, [])

    const { data, isLoading, error } = useQuery<DashboardData>({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const cachedData = localStorage.getItem(CACHE_KEY)
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData)
                if (Date.now() - timestamp < CACHE_TIME) {
                    return data
                }
            }

            const response = await fetch("/api/dashboard")
            if (!response.ok) {
                throw new Error("Не удалось загрузить данные панели управления")
            }
            const newData = await response.json()
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: newData, timestamp: Date.now() }))
            return newData
        },
        initialData: isCacheValid ? JSON.parse(localStorage.getItem(CACHE_KEY)!).data : initialData,
        staleTime: CACHE_TIME,
    })

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />
    if (error) return <div>Ошибка при загрузке данных панели управления</div>
    if (!data) return null

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.totalProducts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.totalRevenue.toFixed(2)} ₽</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Популярные товары</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {data?.popularProducts.map((product, index) => (
                                <li key={index} className="text-sm">
                                    {product.name} - {product.sales} продаж
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        localStorage.removeItem(CACHE_KEY)
                        window.location.reload()
                    }}
                    className="px-4 py-2 text-white rounded transition-colors"
                >
                    Обновить данные
                </Button>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Аналитика продаж</h2>
                <SalesAnalytics />
            </div>
        </div>
    )
}

