import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.json({ error: "Код скидки не предоставлен" }, { status: 400 })
    }

    try {
        const discount = await prisma.discount.findFirst({
            where: {
                code: code,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
            },
        })

        if (discount) {
            return NextResponse.json({
                type: discount.type,
                value: discount.value,
            })
        } else {
            return NextResponse.json({ error: "Недействительный код скидки" }, { status: 404 })
        }
    } catch (error) {
        console.error("Error applying discount:", error)
        return NextResponse.json({ error: "Не удалось применить скидку" }, { status: 500 })
    }
}

