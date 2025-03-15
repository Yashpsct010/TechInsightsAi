import { useEffect, useState } from 'react';
import { fetchBlogContent } from '../services/geminiApi';

const useBlogContent = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const data = await fetchBlogContent();
            setContent(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
        const intervalId = setInterval(fetchContent, 3 * 60 * 60 * 1000); // Update every 3 hours

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return { content, loading, error };
};

export default useBlogContent;