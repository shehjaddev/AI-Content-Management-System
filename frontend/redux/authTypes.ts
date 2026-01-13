export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
    };
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterResponse {
    id: string;
    email: string;
}
