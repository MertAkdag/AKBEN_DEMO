import { StyleSheet } from "react-native";
import { useResponsive } from "../Hooks/UseResponsive";
import { useTheme } from "../Context/ThemeContext";
import { useMemo } from "react";

// Custom hook - component içinde çağır
export const useScreenStyles = () => {
    const { calculateFontSize } = useResponsive();
    const { colors } = useTheme();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        title: {
            color: colors.text,
            fontWeight: '700',
            marginBottom: 8,
            fontSize: calculateFontSize(24),
        },
    }), [calculateFontSize, colors]);

    return styles;
};
