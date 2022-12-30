import {Button as NButton, IButtonProps, Text} from 'native-base';

type Props = IButtonProps & {
    title: string;
    variant?: 'solid' | 'outline';
};

export function Button({title, variant = 'solid', ...rest}: Props){
    return(
        <NButton
        w='full'
        h={'12'}
        bg={variant === 'outline' ? 'transparent' :'green.700'}
        borderWidth={variant === 'outline' ? 1 : 0}
        borderColor='green.500'
        rounded='sm'
        _pressed={{
            bg: variant === 'outline' ? 'gray.900' : 'green.900',
        }}
        {...rest}
        >
            <Text
            color={variant === 'outline' ? 'green.500' : 'white'}
            fontFamily='heading'
            fontSize={'sm'}
            >
                {title}
            </Text>
        </NButton>
    )
}