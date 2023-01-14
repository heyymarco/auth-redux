import { Container, ContainerProps } from "@reusable-ui/components";



export function Main(props: ContainerProps) {
    return (
        <Container
            {...props}
            
            tag={props.tag ?? 'main'}
        />
    )
}