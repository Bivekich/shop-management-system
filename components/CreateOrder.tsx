"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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

const orderSchema = z.object({
    customerName: z.string().min(1, "Имя клиента обязательно"),
    deliveryAddress: z.string().min(1, "Адрес доставки обязателен"),
    orderItems: z.array(
        z.object({
            productId: z.number(),
            quantity: z.number().min(1, "Количество должно быть не менее 1"),
        })
    ),
})

type OrderData = z.infer<typeof orderSchema>

type Product = {
    id: number;
    name: string;
    price: number;
};

export default function CreateOrder() {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<OrderData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            orderItems: [{ productId: 0, quantity: 1 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "orderItems",
    })

    const { data: products } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await fetch("/api/products")
            if (!response.ok) {
                throw new Error("Не удалось загрузить товары")
            }
            return response.json()
        }
    })

    const createOrderMutation = useMutation<OrderData, Error, OrderData>({
        mutationFn: async (data: OrderData) => {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error("Не удалось создать заказ")
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            toast({
                title: "Заказ успешно создан",
                description: "Новый заказ был добавлен в базу данных.",
            })
            reset()
        },
        onError: () => {
            toast({
                title: "Ошибка",
                description: "Не удалось создать заказ. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        },
    })

    const onSubmit = (data: OrderData) => {
        createOrderMutation.mutate(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                {...register("customerName")}
                placeholder="Имя клиента"
                className="w-full"
            />
            {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.customerName.message}
                </p>
            )}
            <Input
                {...register("deliveryAddress")}
                placeholder="Адрес доставки"
                className="w-full"
            />
            {errors.deliveryAddress && (
                <p className="text-red-500 text-sm mt-1">
                    {errors.deliveryAddress.message}
                </p>
            )}
            {fields.map((field, index) => (
                <div key={field.id} className="flex space-x-2">
                    <Select
                        onValueChange={(value) =>
                            setValue(`orderItems.${index}.productId`, Number(value))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Выберите товар" />
                        </SelectTrigger>
                        <SelectContent>
                            {products?.map((product: Product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name} - {product.price.toFixed(2)} ₽
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        {...register(`orderItems.${index}.quantity`, {
                            valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Количество"
                        className="w-1/3"
                    />
                    <Button type="button" onClick={() => remove(index)}>
                        Удалить
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                onClick={() => append({ productId: 0, quantity: 1 })}
            >
                Добавить товар
            </Button>
            <Button type="submit" className="w-full">
                Создать заказ
            </Button>
        </form>
    )
}

