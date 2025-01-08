import { useLoadingStore } from '../store/loading/loadingStore';

export const useLoading = () => {
    const { isLoading, setLoading } = useLoadingStore();

    const showLoading = () => setLoading(true);
    const hideLoading = () => setLoading(false);

    return {
        isLoading,
        showLoading,
        hideLoading,
    };
}; 