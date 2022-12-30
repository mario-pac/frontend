import { AppError } from "@utils/AppError";
import axios, { AxiosInstance } from "axios";
import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";

type RegisterInterceptTokenManagerProps = {
    signOut: () => void;
    refreshTokenUpdated: (newToken: string) => void
}

type ApiInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: ({}: RegisterInterceptTokenManagerProps) => () => void
}


type PromiseType = {
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
}
//refreshTokenUpdated

type ProcessQueueParams = {
    error: Error | null
    token: string | null
}

const api = axios.create({
    baseURL: 'http://192.168.100.160:8080'
}) as ApiInstanceProps;

let isRefreshing = false
let failedQueue: Array<PromiseType> = []

const processQueue = ({error, token=null}: ProcessQueueParams):void => {
    failedQueue.forEach(request => {
        if(error){
            request.reject(error)
        }
        else{
            request.resolve(token)
        }
    })

    failedQueue = []
}

api.registerInterceptTokenManager = ({signOut, refreshTokenUpdated}) => {
    const interceptTokenManager = api.interceptors.response.use(response => response, async requestErr => {
        if(requestErr?.response?.status === 401){
            if(requestErr.response.data?.message === 'token.expired' || requestErr.response.data?.message === 'token.invalid'){
                const  oldToken = await storageAuthTokenGet()
                if(!oldToken){
                    signOut()
                    return Promise.reject(requestErr)
                }

                const originalRequest = requestErr.config

                if(isRefreshing){
                    return new Promise((resolve, reject) => {
                        failedQueue.push({resolve, reject})
                    })
                    .then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`
                        return axios(originalRequest)
                    })
                    .catch((err) => {
                        throw err
                    })
                }

                isRefreshing = true

                return new Promise(async (resolve, reject) => {
                    try {
                        const {data} = await api.post('/sessions/refresh-token', {token: oldToken})
                        await storageAuthTokenSave(data.token)

                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
                        originalRequest.headers['Authorization'] = `Bearer ${data.token}`

                        refreshTokenUpdated(data.token)

                        processQueue({error: null, token: data.token})
                        resolve(originalRequest)
                    } catch (error: any) {
                        processQueue({error, token: null})
                        signOut()
                        reject(error)
                    } finally {
                        isRefreshing = false
                    }
                    
                })

            }

            signOut()
        }

        if(requestErr.response && requestErr.response.data){
            return Promise.reject(new AppError(requestErr.response.data.message));
        }
        else{
            return Promise.reject(requestErr);
        }
    })

    return () => {
        api.interceptors.response.eject(interceptTokenManager)
    }
}

export {api}