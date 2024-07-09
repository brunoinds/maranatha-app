import { IUser} from "@/interfaces/UserInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";




export class UsersStore{
    private static users: Array<IUser> | null = null;
    
    public static async getUsers() : Promise<Array<IUser>>{
        if (UsersStore.users){
            return UsersStore.users;
        }else{
            await UsersStore.getUsersFromServer();
            return UsersStore.users as unknown as Array<IUser>;
        }
    }

    private static async getUsersFromServer(){
        const response = await RequestAPI.get('/users');
        UsersStore.users = response;
    }

    public static async refreshUsers()
    {
        await UsersStore.getUsersFromServer();
    }
}