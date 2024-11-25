"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const productSchema = z.object({
    name: z.string().min(1, "Название товара обязательно"),
    price: z.number().min(0.01, "Цена должна быть больше 0"),
})

type ProductData = z.infer<typeof productSchema>

export default function AddProduct() {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProductData>({
        resolver: zodResolver(productSchema),
    })

    const addProductMutation = useMutation<ProductData, Error, ProductData>({
        mutationFn: async (data: ProductData) => {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error("Не удалось добавить товар")
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast({
                title: "Товар успешно добавлен",
                description: "Новый товар был добавлен в базу данных.",
            })
            reset()
        },
        onError: () => {
            toast({
                title: "Ошибка",
                description: "Не удалось добавить товар. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        },
    })

    const onSubmit = (data: ProductData) => {
        addProductMutation.mutate(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Input
                    {...register("name")}
                    placeholder="Название товара"
                    className="w-full"
                />
                {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
            </div>
            <div>
                <Input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Цена"
                    className="w-full"
                />
                {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
            </div>
            <Button type="submit" className="w-full">
                Добавить товар
            </Button>
        </form>
    )
}
