import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import {Center, ScrollView, VStack, Skeleton, Text, Heading, useToast, Toast} from 'native-base';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '@hooks/useAuth';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import userPhotoDefaultPng from '@assets/userPhotoDefault.png';

const PHOTO_SIZE = 40;

type FormDataProps = {
    name: string
    email: string
    old_password: string
    password: string
    confirmPassword: string
}

export function Profile(){
    const [isUpdating, setIsUpdating] = useState(false)
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const profileSchema = yup.object({
        name: yup.string().required('Informe o nome!'),
        password: yup.string().min(6, "Digite pelo menos 6 dígitos para a senha!").nullable().transform((value) => !!value ? value : null),
        confirmPassword: yup.string().nullable().transform((value) => !!value ? value : null).oneOf([yup.ref("password"), , null], "As senhas são diferentes!").when('password', {
            is: (Field: any) => Field,
            then: yup.string().nullable().required('Confirme a senha!')
            .transform((value) => !!value ? value : null)
        }),
    })

    const toast = useToast()
    const {user, updateUserProfile} = useAuth()
    const {control, handleSubmit, formState: {errors}} = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email,
        },
        resolver: yupResolver(profileSchema)
    })


    async function handleUserPhotoSelect(){
        setPhotoIsLoading(true);
        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
                selectionLimit: 1,
            });

            if(photoSelected.canceled){
                return;
            }
    
            if (photoSelected.assets[0].uri){
                const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);

                if(photoInfo.size && (photoInfo.size / 1024 / 1024) > 5){
                    return toast.show({
                        title: 'Essa imagem é muito grande! Escolha uma de até 5MB.',
                        placement: 'top',
                        bgColor: 'red.500',  
                    })
                }

                const fileExtension = photoSelected.assets[0].uri.split('.').pop()

                const photoFile = {
                    name: `${user.name}.${fileExtension}`.toLowerCase(),
                    uri: photoSelected.assets[0].uri,
                    type: `${photoSelected.assets[0].type}/${fileExtension}`
                } as any

                const userPhotoUploadForm = new FormData()
                userPhotoUploadForm.append('avatar', photoFile)

                const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                const userUpdated = user
                userUpdated.avatar = avatarUpdatedResponse.data.avatar
                updateUserProfile(userUpdated)
                Toast.show({
                    title: 'Foto atualizada!',
                    placement: 'top',
                    bg: 'green.700'
                })
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPhotoIsLoading(false)
        }
    }

    async function handleProfileUpdate(data: FormDataProps){
        try {
            setIsUpdating(true)

            const userUpdated = user
            userUpdated.name = data.name
            
            await api.put('/users', data)

            await updateUserProfile(userUpdated)
            
            toast.show({
                title: 'Dados atualizados com sucesso!',
                bg: 'green.700',
                placement: 'top',
            })
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar os dados. Tente novamente mais tarde!'
            toast.show({
                title,
                bg: 'red.500',
                placement: 'top',
            })
        }
        finally {
            setIsUpdating(false)
        }
    }
    
    return(
        <VStack flex={1}>
            <ScreenHeader title='Perfil'/>

            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
            <Center mt={6} px={10}>
            {
            photoIsLoading ?
            <Skeleton 
            w={PHOTO_SIZE} h={PHOTO_SIZE} rounded={'full'}
            startColor={'gray.400'} endColor={'gray.200'}
            />
            :
            <UserPhoto
            source={user.avatar ? {uri: `${api.defaults.baseURL}/avatar/${user.avatar}`} : userPhotoDefaultPng}
            alt={'Foto do usuário'}
            size={PHOTO_SIZE}
            />}

            <TouchableOpacity onPress={handleUserPhotoSelect}>
                <Text color='green.500' fontWeight={'bold'} fontSize='md' mb={2}>
                    Alterar foto
                </Text>
            </TouchableOpacity>

            <Controller
            control={control}
            name='name'
            render={({field: {value, onChange}}) => (
                <Input
                bg={'gray.600'}
                placeholder='Nome'
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
                />
            )}
            />

            <Controller
            control={control}
            name='email'
            render={({field: {value, onChange}}) => (
                <Input
                bg={'gray.600'}
                placeholder='E-mail'
                onChangeText={onChange}
                value={value}
                isDisabled
                />
            )}
            />  
            

            
            </Center>

            <VStack px={10} mt={12} mb={9}>
                <Heading color='gray.200' fontSize='md' mb={2} fontFamily={'heading'}>
                    Alterar senha
                </Heading>

                <Controller
                control={control}
                name='old_password'
                render={({field: {onChange}}) => (
                    <Input 
                    bg={'gray.600'}
                    placeholder='Senha antiga'
                    onChangeText={onChange}
                    secureTextEntry
                    />
                )}
                />
                <Controller
                control={control}
                name='password'
                render={({field: {onChange}}) => (
                    <Input 
                    bg={'gray.600'}
                    placeholder='Nova senha'
                    onChangeText={onChange}
                    errorMessage={errors.password?.message}
                    secureTextEntry
                    />
                )}
                />
                <Controller
                control={control}
                name='confirmPassword'
                render={({field: {onChange}}) => (
                    <Input 
                    bg={'gray.600'}
                    placeholder='Confirmar nova senha'
                    onChangeText={onChange}
                    errorMessage={errors.confirmPassword?.message}
                    secureTextEntry
                    />
                )}
                />

                <Button 
                title='Atualizar'
                mt={4}
                onPress={handleSubmit(handleProfileUpdate)}
                isLoading={isUpdating}
                />
            </VStack>
            </ScrollView>
        </VStack>
    );
}