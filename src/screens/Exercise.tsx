import { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {Heading, HStack, Icon, Text, VStack, Image, Box, ScrollView, Toast} from 'native-base';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import {Feather} from '@expo/vector-icons';
import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionSvg from '@assets/repetitions.svg';

import { Button } from '@components/Button';
import { Loading } from '@components/Loading';

import { ExerciseDTO } from '@dtos/ExercisesDTO';
import { api } from '@services/api';
import { AppError } from '@utils/AppError';

type RouteParamsProps ={
    exerciseId: string
}

export function Exercise(){
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    const route = useRoute()

    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)

    const [sendingRegister, setSendingRegister] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const {exerciseId} = route.params as RouteParamsProps;

    async function fetchExerciseById(){
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/${exerciseId}`);
            setExercise(response.data)
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar o exercício.'
            
            Toast.show({
                title,
                bg: 'red.500',
                placement: 'top',
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleExerciseHistoryRegister(){
        try {
            setSendingRegister(true)
            const response = await api.post('/history/',{exercise_id: exerciseId});
            Toast.show({
                title: 'Parabéns! Exercício registrado no seu histórico!',
                bg: 'green.700',
                placement: 'top',
            })

            navigation.navigate('history')
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível registrar o exercício.'
            
            Toast.show({
                title,
                bg: 'red.500',
                placement: 'top',
            })
        } finally {
            setSendingRegister(false)
        }
    }

    useEffect(() => {
        fetchExerciseById()
    }, [exerciseId]);

    function handleGoBack(){
        navigation.goBack();
    }

    return(
        <VStack flex={1}>
            
            {isLoading ? <Loading/> : 
            <><VStack px={8} bg={'gray.600'} pt={12}>
                    <TouchableOpacity onPress={handleGoBack}>
                        <Icon as={Feather} name='arrow-left' color='green.500' size={6} />
                    </TouchableOpacity>

                    <HStack justifyContent={'space-between'} mt={4} mb={8} alignItems='center'>
                        <Heading color={'gray.100'} fontSize='lg' flexShrink={1} fontFamily={'heading'}>
                            {exercise.name}
                        </Heading>

                        <HStack alignItems={'center'}>
                            <BodySvg />

                            <Text color='gray.200' ml={1} textTransform='capitalize'>
                                {exercise.group}
                            </Text>
                        </HStack>
                    </HStack>
                </VStack><ScrollView showsVerticalScrollIndicator={false}>
                        <VStack p={8}>
                            <Box rounded='lg' mb={3} overflow='hidden'>
                                <Image
                                    w='full'
                                    h={80}
                                    source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                                    alt='Nome do exercício'
                                    resizeMode='cover'
                                    />
                            </Box>

                            <Box bg='gray.600' rounded={'md'} pb={4} px={4}>
                                <HStack alignItems={'center'} justifyContent='space-around' mb={6} mt={5}>
                                    <HStack>
                                        <SeriesSvg />
                                        <Text color='gray.200' ml={'2'}>
                                            {exercise.series} séries
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <RepetitionSvg />
                                        <Text color='gray.200' ml={'2'}>
                                            {exercise.repetitions} repetições
                                        </Text>
                                    </HStack>
                                </HStack>

                                <Button
                                    title='Marcar como realizado' 
                                    isLoading={sendingRegister}
                                    onPress={handleExerciseHistoryRegister}
                                />
                            </Box>
                        </VStack>
                    </ScrollView></>
            }
        </VStack>
    )
}