"use server"

export const triggerResearch = async () => {
    const response = await fetch(`${process.env.WORKERS_URL}/api/version`)
    const result = await response.json()
    console.log(result)
    console.log("hello from trigger research!")
}