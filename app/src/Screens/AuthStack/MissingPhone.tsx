import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NativeStackNavigationProp} from 'react-native-screens/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../../assets/theme.style';
import {useFASignIn} from '../../hooks/useFASignIn';
import {useLocale} from '../../hooks/useLocale';
import PhoneAuth from './PhoneAuth';
import {trigger} from '../../common/utils/fp';
import {openLinkInApp} from '../../utils/link';

const suzumiIcon = require('../../assets/suzumi_icon.png');
const suzumiText = require('../../assets/suzumi_text.png');

type props = {
    navigation: NativeStackNavigationProp<any>;
};

const MissingPhone = (props: props) => {
    const {t} = useLocale();
    const {signOut} = useFASignIn(() => {});
    // const [safeConfirm, setSafeConfirm] = useSafeState<phoneConfirm>();
    // const [phoneNumber, setPhoneNumber] = useState<string>('+45');
    // const [code, setCode] = useState<string>('');
    //
    // const [loading, setLoading] = useState(false);
    // const phoneInputRef = useRef<any>();
    //
    // const handleCodeChange = (text: string): string =>
    //     fromThrowable(parseInt, text)
    //         .chain(Maybe.fromPredicate((a) => a > 0))
    //         .mapOrDefault((num) => num.toString(), '');
    //
    // const handlePhone = async () => {
    //     setLoading(true);
    //     setSafeConfirm(await addPhoneNumber(phoneNumber));
    //     setLoading(false);
    // };
    // const handleConfirm = (confirm: phoneConfirm) => () => {
    //     confirm(code);
    // };
    return (
        <KeyboardAwareScrollView
            extraHeight={75}
            extraScrollHeight={50}
            contentContainerStyle={styles.background}>
            <View style={styles.wrapper}>
                <View
                    style={{
                        flexDirection: 'row',

                        backgroundColor: theme.BACKGROUND_COLOR,
                        justifyContent: 'flex-start',
                    }}>
                    <Pressable
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            padding: theme.padding,
                            paddingLeft: 0,
                            paddingBottom: 0,
                        }}
                        onPress={signOut}>
                        <Icon
                            style={{
                                alignSelf: 'center',
                            }}
                            name="arrow-left"
                            size={22}
                            color="#FFFFFF"
                        />
                        <Text
                            style={{
                                paddingLeft: 20,
                                fontSize: 22,
                                fontFamily: 'Roboto-Medium',
                                color: '#FFF',
                                textTransform: 'capitalize',
                            }}>
                            {t('go back')}
                        </Text>
                    </Pressable>
                </View>
                <View style={styles.spacer} />
                <Image source={suzumiIcon} style={styles.suzumiIcon} />
                <Image source={suzumiText} style={styles.suzumiText} />
                <Text style={styles.text}>
                    {t('Enter phone number to continue')}
                </Text>
                <View style={styles.spacer} />

                <PhoneAuth type={'addProvider'} />
                <View style={styles.spacer} />

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
        padding: 10,
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
        marginVertical: 10,
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Roboto',
    },
    wrapper: {
        paddingHorizontal: 20,
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
        flex: 3,
    },
    confirmButton: {
        flex: 1,
        marginTop: 23,
    },
    background: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suzumiIcon: {
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

export default MissingPhone;
