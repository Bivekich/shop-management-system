'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const discountSchema = z.object({
    name: z.string().min(1, "Название скидки обязательно"),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().min(0, "Значение должно быть положительным числом"),
    code: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
})

type DiscountData = z.infer<typeof discountSchema>

type Discount = DiscountData & {
    id: number
    createdAt: string
    updatedAt: string
}

export default function DiscountManager() {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<DiscountData>({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            type: "PERCENTAGE",
        },
    })

    const { data: discounts, isLoading, error } = useQuery<Discount[]>({
        queryKey: ['discounts'],
        queryFn: async () => {
            const response = await fetch("/api/discounts")
            if (!response.ok) {
                throw new Error("Не удалось загрузить скидки")
            }
            return response.json()
        }
    })

    const createDiscountMutation = useMutation<Discount, Error, DiscountData>({
        mutationFn: async (data: DiscountData) => {
            const response = await fetch("/api/discounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error("Не удалось создать скидку")
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts'] })
            toast({
                title: "Скидка успешно создана",
                description: "Новая скидка была добавлена в базу данных.",
            })
            reset()
        },
        onError: () => {
            toast({
                title: "Ошибка",
                description: "Не удалось создать скидку. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        },
    })

    const onSubmit = (data: DiscountData) => {
        createDiscountMutation.mutate(data)
    }

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />
    if (error) return <div>Ошибка при загрузке скидок</div>

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Создать новую скидку</CardTitle>
                    <CardDescription>Заполните форму для создания новой скидки</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                {...register("name")}
                                placeholder="Название скидки"
                                className="w-full"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <Select
                                onValueChange={(value) => setValue("type", value as "PERCENTAGE" | "FIXED")}
                                defaultValue="PERCENTAGE"
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите тип скидки" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Процентная</SelectItem>
                                    <SelectItem value="FIXED">Фиксированная</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Input
                                {...register("value", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                placeholder="Значение скидки"
                                className="w-full"
                            />
                            {errors.value && (
                                <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>
                            )}
                        </div>
                        <div>
                            <Input
                                {...register("code")}
                                placeholder="Код купона (если применимо)"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Input
                                {...register("startDate")}
                                type="date"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Input
                                {...register("endDate")}
                                type="date"
                                className="w-full"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Создать скидку
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Список скидок</CardTitle>
                    <CardDescription>Просмотр существующих скидок</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead>Значение</TableHead>
                                <TableHead>Код</TableHead>
                                <TableHead>Начало</TableHead>
                                <TableHead>Конец</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts?.map((discount) => (
                                <TableRow key={discount.id}>
                                    <TableCell>{discount.name}</TableCell>
                                    <TableCell>{discount.type}</TableCell>
                                    <TableCell>{discount.value}</TableCell>
                                    <TableCell>{discount.code || "-"}</TableCell>
                                    <TableCell>{format(new Date(discount.startDate), "dd.MM.yyyy")}</TableCell>
                                    <TableCell>{format(new Date(discount.endDate), "dd.MM.yyyy")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

