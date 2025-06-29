import { makeRedirectUri, useAuthRequest, exchangeCodeAsync, ResponseType } from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Alert } from 'react-native';

const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const GOOGLE_CLIENT_ID = '680243298823-f7d0ielrise2vtoq5hm63cf59jbk2n2s.apps.googleusercontent.com';

export function useGoogleAuth() {
    const redirectUri = (() => {
        if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
            return 'https://auth.expo.io/@pkmst/lankatrails-mobile-app';
        } else if (Platform.OS === 'web') {
            return makeRedirectUri({ preferLocalhost: true, path: 'redirect' });
        } else {
            return makeRedirectUri({ scheme: 'lankatrailsmobileapp', path: 'redirect' });
        }
    })();
    console.log('Google Auth Redirect URI:', redirectUri);


    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: GOOGLE_CLIENT_ID,
            scopes: ['openid', 'profile', 'email'], // Add 'openid'
            redirectUri,
            responseType: ResponseType.Code,
            extraParams: {
                prompt: 'select_account', // Forces account selection
                access_type: 'offline', // Gets refresh token
            },
        },
        discovery
    );

    // ===== ERROR HANDLER =====
    useEffect(() => {
        if (response?.type === 'error') {
            console.error('Authentication Error:', {
                error: response.error,
                params: response.params
            });
            
            Alert.alert(
                'Authentication Failed',
                response.error?.description || 
                'Something went wrong during login. Please try again.'
            );
        }
    }, [response]);
    // ===== END ERROR HANDLER =====

    const exchangeToken = async () => {
        if (response?.type === 'success') {
            const tokens = await exchangeCodeAsync(
                {
                    clientId: GOOGLE_CLIENT_ID,
                    code: response.params.code,
                    redirectUri,
                    extraParams: { code_verifier: request?.codeVerifier ?? '' },
                },
                discovery
            );

            return tokens;
        } else {
            throw new Error('Google login cancelled or failed');
        }
    };

    return {
        request,
        response,
        promptAsync,
        exchangeToken,
    };
}
