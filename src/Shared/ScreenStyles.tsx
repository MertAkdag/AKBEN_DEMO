import { Colors } from "../Constants/Colors";
import { StyleSheet } from "react-native";
import { useResponsive } from "../Hooks/UseResponsive";
import { useMemo } from "react";

// Statik stiller (responsive olmayan)
const staticStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        color: Colors.text,
        fontWeight: '700',
        marginBottom: 8,
    },
});

// Custom hook - component içinde çağır
export const useScreenStyles = () => {
    const { calculateFontSize } = useResponsive();

    const styles = useMemo(() => ({
        container: staticStyles.container,
        title: {
            ...staticStyles.title,
            fontSize: calculateFontSize(24),
        },
    }), [calculateFontSize]);

    return styles;
};