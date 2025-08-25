"use client"

import React from "react"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"



export default function MataroCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg bg-transparent p-0 w-full"
            locale={es}
        />
    )
}

