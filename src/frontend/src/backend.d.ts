import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    name: string;
    color: string;
    size: string;
    productId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    total: bigint;
    owner: Principal;
    createdAt: bigint;
    address: string;
    items: Array<OrderItem>;
    customerEmail: string;
}
export interface UserProfile {
    name: string;
    email: string;
    address: string;
}
export interface Product {
    id: bigint;
    featured: boolean;
    name: string;
    description: string;
    sizes: Array<string>;
    stock: bigint;
    imageUrl: string;
    category: string;
    colors: Array<string>;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(id: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getOrder(id: bigint): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(order: Order): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedProducts(): Promise<void>;
    updateOrderStatus(id: bigint, status: string): Promise<boolean>;
    updateProduct(id: bigint, product: Product): Promise<boolean>;
}
