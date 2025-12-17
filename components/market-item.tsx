import Image from "next/image"

import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemHeader,
    ItemTitle,
    ItemActions
} from "@/components/ui/item"



const models = [
    {
        name: "Lavadora",
        description: "Lavadora de 10 kg",
        image: "",
        price: 100,
    },
    {
        name: "Cocina",
        description: "Cocina de 10 kg",
        image: "",
        price: 200,
    },
    {
        name: "Secadora",
        description: "Secadora de 10 kg",
        image: "",
        price: 300,
    },
        {
        name: "Lavadora",
        description: "Lavadora de 10 kg",
        image: "",
        price: 100,
    },
    {
        name: "Cocina",
        description: "Cocina de 10 kg",
        image: "",
        price: 200,
    },
    {
        name: "Secadora",
        description: "Secadora de 10 kg",
        image: "",
        price: 300,
    },
        {
        name: "Lavadora",
        description: "Lavadora de 10 kg",
        image: "",
        price: 100,
    },
    {
        name: "Cocina",
        description: "Cocina de 10 kg",
        image: "",
        price: 200,
    },
    {
        name: "Secadora",
        description: "Secadora de 10 kg",
        image: "",
        price: 300,
    },
        {
        name: "Lavadora",
        description: "Lavadora de 10 kg",
        image: "",
        price: 100,
    },
    {
        name: "Cocina",
        description: "Cocina de 10 kg",
        image: "",
        price: 200,
    },
    {
        name: "Secadora",
        description: "Secadora de 10 kg",
        image: "",
        price: 300,
    },
        {
        name: "Lavadora",
        description: "Lavadora de 10 kg",
        image: "",
        price: 100,
    },
    {
        name: "Cocina",
        description: "Cocina de 10 kg",
        image: "",
        price: 200,
    },
    {
        name: "Secadora",
        description: "Secadora de 10 kg",
        image: "",
        price: 300,
    },
]

export default function MarketItem() {
    return (
        <div className="flex w-full max-w-xl md:max-w-3xl flex-col gap-6">
            <ItemGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {models.map((model) => (
                    <Item key={model.name} variant="outline">
                        <ItemHeader className="cursor-pointer">
                            {model.image ? (
                                <Image
                                    src={model.image}
                                    alt={model.name}
                                    width={128}
                                    height={128}
                                    className="aspect-square w-full rounded-sm object-cover"
                                />
                            ) : (
                                <div className="aspect-square w-full rounded-sm bg-gradient-to-br from-primary to-secondary" />
                            )}
                        </ItemHeader>
                        <ItemContent className="cursor-pointer w-full">
                            <ItemTitle>{model.name}</ItemTitle>
                            <ItemActions>{model.price}{' '}€</ItemActions>
                            <ItemDescription>{model.description}</ItemDescription>
                        </ItemContent>
                    </Item>
                ))}
            </ItemGroup>
        </div>
    )
}
