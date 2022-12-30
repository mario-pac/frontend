import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {VStack, Image, Text, Center, Heading, ScrollView, Toast} from 'native-base';

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { useForm, Controller } from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup'
import * as yup from 'yup';

import { useAuth } from '@hooks/useAuth';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';
import { AppError } from '@utils/AppError';

type FormDataProps = {
    email: string,
    password: string,
}

const signInSchema = yup.object({
    email: yup.string().required('Informe o email!').email('Email inválido!'),
    password: yup.string().required('Informe a senha!').min(6, 'A senha tem no mínimo 6 dígitos!'),
});


export function SignIn(){

    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<AuthNavigatorRoutesProps>();

    const {control, handleSubmit, formState: {errors}} = useForm<FormDataProps>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: yupResolver(signInSchema)
    });

    function handleNewAccount(){
        navigation.navigate('signUp')
    }

    const {signIn} = useAuth()

    async function handleSignIn({email, password}: FormDataProps){
        try {
            setIsLoading(true)
            await signIn(email, password)
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível realizar o login. Tente novamente mais tarde!'
            Toast.show({
                title,
                bg: 'red.500',
                placement: 'top',
            })
            setIsLoading(false)
        }
    }

    return(
        <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
            <VStack flex={1} px={10}>
                <Image 
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt='Pessoas treinando'
                    resizeMode='contain'
                    position={'absolute'}
                />

                <Center my={24}>
                    <LogoSvg />

                    <Text color={'gray.100'} fontSize='sm'>
                        Treine sua mente e seu corpo
                    </Text>
                </Center>

                <Center>
                    <Heading color='gray.100' fontSize='xl' mb={6} fontFamily='heading'>
                    Acesse sua conta
                    </Heading>

                    <Controller
                    control={control}
                    name='email'
                    render={( {field: {onChange, value}}) => (
                        <Input
                        placeholder='E-mail'
                        keyboardType='email-address'
                        autoCapitalize='none'
                        onChangeText={onChange}
                        value={value}
                        errorMessage= {errors.email?.message}
                        />
                    )}
                    />
                    <Controller
                    control={control}
                    name='password'
                    render={( {field: {onChange, value}}) => (
                        <Input
                        placeholder='Senha'
                        secureTextEntry
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize='none'
                        errorMessage= {errors.password?.message}
                        />
                    )}
                    />

                    <Button
                    title='Acessar'
                    onPress={handleSubmit(handleSignIn)}
                    isLoading={isLoading}
                    />
                </Center>
                <Center mt={48}>
                <Text color={'gray.100'} fontSize='sm' mb={3} fontFamily='body'>
                    Ainda não tem acesso?
                </Text>
                
                <Button
                    title='Criar conta'
                    variant={'outline'}
                    onPress={handleNewAccount}
                />
                </Center>
            </VStack>
        </ScrollView>
    )
}