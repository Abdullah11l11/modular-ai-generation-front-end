interface Props {

    title?: string

    description?: string

}

export function ErrorState({

    title = "Something went wrong",

    description = "Please try again later.",

}: Props) {

    return (

        <div className="flex h-72 items-center justify-center">

            <div className="text-center">

                <h2 className="text-lg font-semibold">

                    {title}

                </h2>

                <p className="text-muted-foreground">

                    {description}

                </p>

            </div>

        </div>

    )

}