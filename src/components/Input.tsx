import {Input as NBInput, IInputProps, FormControl} from 'native-base'

type Props = IInputProps & {
    errorMessage?: string | null;
}

export function Input({errorMessage = null, isInvalid, ...rest}: Props){
    const invalid = !!errorMessage || isInvalid;

    return(
        <FormControl isInvalid={invalid} mb={4}>
            <NBInput
            bg={'gray.700'}
            h={'12'}
            px={4}
            borderWidth={0}
            fontSize={'md'}
            color='gray.100'
            fontFamily={'body'}
            placeholderTextColor='gray.500'
            isInvalid={invalid}
            _invalid={{
                borderWidth: 1,
                borderColor: 'red.500'
            }}
            {...rest}
            _focus={{
                bg: 'gray.700',
                borderWidth: 1,
                borderColor: 'green.500',
            }}
            />
            <FormControl.ErrorMessage _text={{ color: 'red.500'}}>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    )
}