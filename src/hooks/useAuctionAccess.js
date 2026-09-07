import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import { checkAuctionAccess } from "../api/auctionAccessApi";

export default function useAuctionAccess(auctionId) {
    const [access, setAccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkAccess = useCallback(async () => {
        if (!auctionId) return;

        setLoading(true);

        try {
            const response = await checkAuctionAccess(auctionId);

            const data =
                response?.data ||
                response?.access ||
                response;

            setAccess(data);

            return data;
        } catch (error) {
            const message =
                error.normalizedMessage ||
                error.message ||
                "Unable to check auction access.";

            toast.error(message);

            setAccess({
                allowed: false,
                message,
            });

            return null;
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    return {
        access,
        loading,
        checkAccess,
    };
}