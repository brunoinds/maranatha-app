interface IUser{
    id: number,
    name: string,
    email: string,
    username: string,
    email_verified_at: null,
    created_at: string,
    updated_at: string,
    roles: string[],
    permissions: string[],
}
export const userPermissionsAvailable = [
    {
        id: "view-reports",
        name: "Acceso a Reportes"
    },
    {
        id: "view-inventory",
        name: "Acceso al Inventario"
    },
    {
        id: "view-attendances",
        name: "Acceso a Asistencias"
    },
    {
        id: "view-wallet",
        name: "Acceso a Billetera"
    }
]


export type { IUser };