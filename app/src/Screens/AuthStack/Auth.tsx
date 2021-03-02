import React from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NativeStackNavigationProp} from 'react-native-screens/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import {suzumiIcon, suzumiText} from '../../assets/staticImages';
import theme from '../../assets/theme.style';
import {useFASignIn} from '../../hooks/useFASignIn';
import {useSafeState} from '../../hooks/useSafeState';
import PhoneAuth from './PhoneAuth';
import {useLocale} from '../../hooks/useLocale';
import {Condition} from '../../components/logicalLib';
import {openLinkInApp} from '../../utils/link';
import {trigger} from '../../common/utils/fp';
import appleAuth from '@invertase/react-native-apple-authentication';

// const suzumiIcon = require('../../assets/suzumi_icon.png');
// const suzumiText = require('../../assets/suzumi_text.png');

type props = {
    navigation: NativeStackNavigationProp<any>;
};

const Auth = (props: props) => {
    const {t} = useLocale();
    const [error, setError] = useSafeState<string>();
    const {signInWithFacebook, signInWithGoogle, signInWithApple} = useFASignIn(
        setError,
    );
    // const [safeConfirm, setSafeConfirm] = useSafeState<phoneConfirm>();
    // const [phoneNumber, setPhoneNumber] = useState<string>('+45');
    // const [code, setCode] = useState<string>('');
    // const [loading, setLoading] = useState(false);
    // const phoneInputRef = useRef<any>();
    // const handleCodeChange = (text: string): string =>
    //     fromThrowable(parseInt, text)
    //         .chain(Maybe.fromPredicate((a) => a > 0))
    //         .mapOrDefault((num) => num.toString(), '');
    //
    // const handlePhone = async () => {
    //     setLoading(true);
    //     signInWithPhoneNumber(phoneNumber)
    //         .then(_.flow(setSafeConfirm))
    //         .then(() => setLoading(false));
    // };
    // const handleConfirm = (confirm: phoneConfirm) => () => {
    //     confirm(code);
    // };
    return (
        <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            extraHeight={70}
            contentContainerStyle={styles.background}>
            <View style={styles.wrapper}>
                <Image source={suzumiIcon} style={styles.suzumiIcon} />
                <Image source={suzumiText} style={styles.suzumiText} />
                <Text style={styles.text}>
                    {t(
                        'To start earning Suzumi points, verify your phone or connect your social media',
                    )}
                </Text>

                <View style={styles.spacer} />

                <PhoneAuth type={'signIn'} />

                <View style={styles.spacer} />
                {/*<Text*/}
                {/*    style={{*/}
                {/*        ...styles.text,*/}
                {/*        color: '#989898',*/}
                {/*        textTransform: 'uppercase',*/}
                {/*    }}>*/}
                {/*    {t('or connect with') + ':'}*/}
                {/*</Text>*/}
                {/*<View style={styles.socialsContainer}>*/}
                {/*    <TouchableOpacity*/}
                {/*        onPress={signInWithFacebook}*/}
                {/*        style={{*/}
                {/*            backgroundColor: '#3B5998',*/}
                {/*            ...styles.socialsButton,*/}
                {/*        }}>*/}
                {/*        <Icon name="facebook" size={28} color="#fff" />*/}
                {/*    </TouchableOpacity>*/}
                {/*    <TouchableOpacity*/}
                {/*        onPress={signInWithGoogle}*/}
                {/*        style={{*/}
                {/*            backgroundColor: '#DF4930',*/}
                {/*            ...styles.socialsButton,*/}
                {/*        }}>*/}
                {/*        <Icon name="google" size={28} color="#fff" />*/}
                {/*    </TouchableOpacity>*/}
                {/*    <Condition*/}
                {/*        if={Platform.OS === 'ios' && appleAuth.isSupported}>*/}
                {/*        <TouchableOpacity*/}
                {/*            onPress={signInWithApple}*/}
                {/*            style={{*/}
                {/*                backgroundColor: '#000000',*/}
                {/*                ...styles.socialsButton,*/}
                {/*            }}>*/}
                {/*            <Icon name="apple" size={28} color="#fff" />*/}
                {/*        </TouchableOpacity>*/}
                {/*        <></>*/}
                {/*    </Condition>*/}
                {/*</View>*/}
                <Text style={{...styles.text, fontSize: 10}}>
                    {t(
                        'By continuing you confirm that you have read and understood the ',
                    )}
                    <Text
                        onPress={trigger(openLinkInApp)(
                            'https://suzumi.dk/behandling-af-personoplysninger-persondatapolitik-for-suzumi-appen',
                        )}
                        style={{
                            textDecorationLine: 'underline',
                        }}>
                        {t('Privacy Policy')}
                    </Text>
                    {' ' + t('and') + ' '}

                    <Text
                        onPress={trigger(openLinkInApp)(
                            'https://suzumi.dk/vilkar-og-betingelser',
                        )}
                        style={{
                            textDecorationLine: 'underline',
                        }}>
                        {t('Terms of service')}
                    </Text>
                </Text>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    phoneInput: {
        marginTop: 10,
        color: '#fff',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#F8F8F8',
    },
    codeInput: {
        flex: 1,
        marginTop: 10,
        color: '#fff',
        paddingHorizontal: 25,
        paddingVertical: 10,
        padding: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#F8F8F8',
        textAlign: 'center',
    },
    text: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Roboto',
    },
    wrapper: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialsContainer: {
        marginBottom: 30,
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialsButton: {
        marginHorizontal: 15,
        borderRadius: 28,
        width: 53,
        height: 53,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer: {
        flex: 1,
    },
    confirmButton: {
        flex: 1,
        marginTop: 23,
    },
    background: {
        minHeight: '100%',
        backgroundColor: theme.BACKGROUND_COLOR,
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suzumiIcon: {
        marginTop: 50,
        marginBottom: 20,
        resizeMode: 'contain',
        width: 85,
        height: 85,
    },
    suzumiText: {
        marginBottom: 33,
        resizeMode: 'contain',
        width: 140,
        height: 46,
    },
});

export default Auth;
