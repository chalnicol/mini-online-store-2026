import { router } from '@inertiajs/react';
import React, { useContext, useState } from 'react';

export interface CategoryManagementContextType {
    toAddId: number | null;
    toEditId: number | null;
    toMoveId: number | null;
    toDeleteId: number | null;
    setAddId: (id: number | null) => void;
    setEditId: (id: number | null) => void;
    setMoveId: (id: number | null) => void;
    setDeleteId: (id: number | null) => void;
    loading: boolean;
    error: string | null;
    createCategory: (name: string) => void;
    updateCategory: (name: string) => void;
    moveCategory: (id: number | null) => void;
    deleteCategory: (id: number) => void;
    //..
    moveToTopLevel: (id: number) => void;
    clearError: () => void;
    reset: () => void;
}

export const CategoryManagementContext = React.createContext<
    CategoryManagementContextType | undefined
>(undefined);

export const CategoryManagementProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [toAddId, setToAddId] = useState<number | null>(null);
    const [toEditId, setToEditId] = useState<number | null>(null);
    const [toMoveId, setToMoveId] = useState<number | null>(null);
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const options: any = {
        replace: true,
        preserveState: true,
        preserveScroll: true,
        onBefore: () => {
            setLoading(true);
            setError(null);
        },
        onError: (error: any) => {
            setError(error.message || 'Something went wrong');
        },
        onFinish: () => setLoading(false),
    };

    const createCategory = (name: string) => {
        router.post(
            `/admin/categories`,
            {
                name,
                parentId: toAddId,
            },
            {
                ...options,
                onSuccess: () => setToAddId(null),
            },
        );
    };

    const updateCategory = (name: string) => {
        router.patch(
            `/admin/categories/${toEditId}`,
            {
                name,
            },
            {
                ...options,
                onSuccess: () => setToEditId(null),
            },
        );
    };

    const moveCategory = (parentId: number | null = null) => {
        router.patch(
            `/admin/categories/${toMoveId}/move`,
            {
                parentId,
            },
            {
                ...options,
                onSuccess: () => setToMoveId(null),
            },
        );
    };

    const moveCategoryToTopLevel = (categoryId: number) => {
        router.patch(
            `/admin/categories/${categoryId}/move`,
            {
                parentId: null,
            },
            options,
        );
    };

    const deleteCategory = (id: number) => {
        router.delete(`/admin/categories/${id}`, options);
    };

    const reset = () => {
        setToAddId(null);
        setToEditId(null);
        setToMoveId(null);
        setToDeleteId(null);
    };
    const clearError = () => {
        setError(null);
    };

    const value: CategoryManagementContextType = {
        //.
        toAddId,
        setAddId: setToAddId,
        toEditId,
        setEditId: setToEditId,
        toMoveId,
        setMoveId: setToMoveId,
        toDeleteId,
        setDeleteId: setToDeleteId,
        //..
        loading,
        error,
        createCategory,
        updateCategory,
        moveCategory,
        deleteCategory,
        moveToTopLevel: moveCategoryToTopLevel,
        clearError,
        reset,
    };

    return (
        <CategoryManagementContext.Provider value={value}>
            {children}
        </CategoryManagementContext.Provider>
    );
};

export const useCategoryManagement = () => {
    const context = useContext(CategoryManagementContext);
    if (!context) throw new Error('useCategory must be used within Provider');
    return context;
};
