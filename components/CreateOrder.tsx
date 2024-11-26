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
import { useState, useEffect, useCallback } from "react";

const orderSchema = z.object({
    customerName: z.string().min(1, "Имя клиента обязательно"),
    deliveryAddress: z.string().min(1, "Адрес доставки обязателен"),
    orderItems: z.array(
        z.object({
            productId: z.number(),
            quantity: z.number().min(1, "Количество должно быть не менее 1"),
        })
    ),
    promoCode: z.string().optional(),
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
        getValues,
        formState: { errors },
        watch,
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

    const [discount, setDiscount] = useState<{ type: 'PERCENTAGE' | 'FIXED', value: number } | null>(null)
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const calculateTotal = useCallback((items: { productId?: number; quantity?: number }[]) => {
        const subtotal = items.reduce((sum, item) => {
            if (item.productId === undefined || item.quantity === undefined) return sum;
            const product = products?.find(p => p.id === item.productId)
            return sum + (product?.price || 0) * item.quantity
        }, 0)

        if (discount) {
            if (discount.type === 'PERCENTAGE') {
                return subtotal * (1 - discount.value / 100)
            } else {
                return Math.max(subtotal - discount.value, 0)
            }
        }

        return subtotal
    }, [products, discount]);

    const createOrderMutation = useMutation<OrderData, Error, OrderData>({
        mutationFn: async (data: OrderData) => {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...data, discountCode: data.promoCode }),
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

    const applyPromoCode = async (code: string) => {
        try {
            const response = await fetch(`/api/discounts/apply?code=${code}`)
            if (response.ok) {
                const discountData = await response.json()
                setDiscount(discountData)
                const items = getValues("orderItems");
                const newTotal = calculateTotal(items);
                setTotalPrice(newTotal);
                toast({
                    title: "Промокод применен",
                    description: `Скидка ${discountData.type === 'PERCENTAGE' ? discountData.value + '%' : discountData.value + ' ₽'} применена`,
                })
            } else {
                setDiscount(null)
                const items = getValues("orderItems");
                const newTotal = calculateTotal(items);
                setTotalPrice(newTotal);
                toast({
                    title: "Ошибка",
                    description: "Неверный промокод",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error applying promo code:", error)
            toast({
                title: "Ошибка",
                description: "Не удалось применить промокод",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        const subscription = watch((value) => {
            const items = value.orderItems?.filter((item): item is NonNullable<typeof item> =>
                item !== undefined && item.productId !== undefined && item.quantity !== undefined
            ) || [];
            const newTotal = calculateTotal(items);
            setTotalPrice(newTotal);
        });
        return () => subscription.unsubscribe();
    }, [watch, calculateTotal]);


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
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Товары</h3>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex space-x-2 mb-2">
                        <Select
                            onValueChange={(value) => {
                                setValue(`orderItems.${index}.productId`, Number(value));
                                const items = getValues("orderItems");
                                const newTotal = calculateTotal(items);
                                setTotalPrice(newTotal);
                            }}
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
                                onChange: () => {
                                    const items = getValues("orderItems");
                                    const newTotal = calculateTotal(items);
                                    setTotalPrice(newTotal);
                                },
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
                    className="mt-2"
                >
                    Добавить товар
                </Button>
            </div>
            <div className="flex space-x-2">
                <Input
                    {...register("promoCode")}
                    placeholder="Промокод"
                    className="w-full"
                />
                <Button type="button" onClick={() => applyPromoCode(getValues("promoCode") || "")}>
                    Применить
                </Button>
            </div>
            <div className="text-right">
                <p className="text-lg font-semibold">
                    Итого: {totalPrice.toFixed(2)} ₽
                </p>
                {discount && (
                    <p className="text-sm text-green-600">
                        Скидка: {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `${discount.value} ₽`}
                    </p>
                )}
            </div>
            <Button type="submit" className="w-full">
                Создать заказ
            </Button>
        </form>
    )
}

