import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing } from '../../Constants/Spacing';
import { DarkTheme } from '../../Constants/Theme';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Uygulama çöktüğünde kullanıcıya gösterilecek ekran */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir hata oluştu</Text>
          <Text style={styles.message}>Lütfen uygulamayı yeniden başlatın.</Text>
          <Button
            title="Yeniden dene"
            variant="outline"
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    backgroundColor: DarkTheme.background,
  },
  title: {
    color: DarkTheme.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: DarkTheme.subtext,
    fontSize: 14,
    textAlign: 'center',
  },
});
