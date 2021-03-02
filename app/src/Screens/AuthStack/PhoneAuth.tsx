import _ from 'lodash/fp';
import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import PhoneInput from 'react-native-phone-number-input';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../../assets/theme.style';
import ConfirmButton from '../../components/ConfirmButton';
import {Condition} from '../../components/logicalLib';
import {useAddPhoneNumber} from '../../hooks/useAddFAProvider';
import {phoneConfirm, useFASignIn} from '../../hooks/useFASignIn';
import {useSafeState} from '../../hooks/useSafeState';
import {useUserOperations} from '../../hooks/useUserOperations';
import {useLocale} from '../../hooks/useLocale';

// const suzumiIcon = require('../../assets/suzumi_icon.png');
// const suzumiText = require('../../assets/suzumi_text.png');

type props = {
    type: 'signIn' | 'addProvider' | 'update';
    onComplete?: () => any;
};

const fbSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14.906" height="27.831" viewBox="0 0 14.906 27.831">
  <defs>
    <style>
      .cls-1 {
        fill: #fff;
      }
    </style>
  </defs>
  <path id="facebook-f-brands" class="cls-1" d="M36.819,15.655l.773-5.037H32.759V7.35A2.518,2.518,0,0,1,35.6,4.629h2.2V.34A26.794,26.794,0,0,0,33.9,0c-3.98,0-6.582,2.412-6.582,6.78v3.839H22.89v5.037h4.424V27.831h5.445V15.655Z" transform="translate(-22.89)"/>
</svg>
`;

const countrPickerTheme = {
    primaryColor: 'blue',
    primaryColorVariant: 'red',
    backgroundColor: theme.BACKGROUND_COLOR,
    onBackgroundTextColor: theme.BACKGROUND_COLOR,
    fontSize: 16,
    fontFamily: 'Roboto',
    filterPlaceholderTextColor: 'white',
    activeOpacity: 1,
    itemHeight: 20,
    flagSize: 20,
    flagSizeButton: 20,
};
const CELL_COUNT = 6;

type PhoneAuthFunc = (number: string) => Promise<(code: string) => void>;

const PhoneAuth = (props: props) => {
    const {t} = useLocale();
    const [error, setError] = useSafeState<string>();
    const {signInWithPhoneNumber} = useFASignIn(setError);
    const {addPhoneNumber} = useAddPhoneNumber(setError);
    const {updatePhoneNumber} = useUserOperations(setError);
    const authFunc: PhoneAuthFunc =
        props.type === 'signIn'
            ? signInWithPhoneNumber
            : props.type === 'update'
            ? updatePhoneNumber
            : addPhoneNumber;
    // const error: Maybe<string> =
    //     props.type === 'signIn' ? signInError : addPhoneError;
    const [safeConfirm, setSafeConfirm] = useSafeState<phoneConfirm>();
    const [countryCode, setCountryCode] = useState<any>('DK');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [
        unformattedPhoneNumber,
        setUnformattedPhoneNumber,
    ] = useState<string>('');
    // const [countryCode, setCountryCode] = useState<string>('+45');
    // const [countryISO, setCountryISO] = useState<string>('dk');
    // useEffect(() => {
    //     setPhoneNumber(countryCode);
    // }, [countryCode]);
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const phoneInputRef = useRef<any>();

    // const handleCodeChange = (text: string): string =>
    //     fromThrowable(parseInt, text)
    //         .chain(Maybe.fromPredicate((a) => a > 0))
    //         .mapOrDefault((num) => num.toString(), '');
    // const handleAutoCheck = ()=>
    useEffect(() => {
        error.ifJust((message) => Alert.alert(message));
        setError();
    }, [error, setError]);
    const handlePhone = async () => {
        setLoading(true);
        authFunc(phoneNumber)
            .then(_.flow(setSafeConfirm))
            .then(() => setLoading(false));
    };
    const handleConfirm = (confirm: phoneConfirm) => (c: string) => {
        setLoading(true);
        confirm(c).then(() => {
            setLoading(false);

            props.onComplete ? props.onComplete() : null;
        });
    };

    // const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value: code, cellCount: CELL_COUNT});
    const [p, getCellOnLayoutHandler] = useClearByFocusCell({
        value: code,
        setValue: setCode,
    });
    console.log('formatted', safeConfirm.isJust());
    // console.log(unformattedPhoneNumber);

    return (
        <Condition if={loading}>
            <ActivityIndicator size={100} color={theme.HIGHLIGHT} />
            {safeConfirm.mapOrDefault(
                (confirm) => (
                    <>
                        <CodeField
                            autoFocus
                            ref={ref}
                            {...p}
                            value={code}
                            onChangeText={(newCode) =>
                                newCode.length >= CELL_COUNT
                                    ? handleConfirm(confirm)(newCode)
                                    : setCode(newCode)
                            }
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({index, symbol, isFocused}) => (
                                <View style={{flexDirection: 'column'}}>
                                    <Text
                                        key={index}
                                        style={[
                                            styles.cell,
                                            isFocused && styles.focusCell,
                                        ]}
                                        onLayout={getCellOnLayoutHandler(
                                            index,
                                        )}>
                                        {symbol ||
                                            (isFocused ? <Cursor /> : null)}
                                    </Text>
                                    <View style={styles.codeBottomBorder} />
                                </View>
                            )}
                        />
                        {/*<View style={{flexDirection: 'row'}}>*/}
                        {/*    <TextInput*/}
                        {/*        textContentType="oneTimeCode"*/}
                        {/*        autoCompleteType="off"*/}
                        {/*        keyboardType="number-pad"*/}
                        {/*        value={code}*/}
                        {/*        placeholder="input code from SMS"*/}
                        {/*        onChangeText={_.flow(handleCodeChange, setCode)}*/}
                        {/*        onSubmitEditing={handleConfirm(confirm)}*/}
                        {/*        style={styles.codeInput}*/}
                        {/*        placeholderTextColor="#999999"*/}
                        {/*    />*/}
                        {/*</View>*/}
                        <View style={{flexDirection: 'row'}}>
                            <ConfirmButton
                                style={styles.confirmButton}
                                onPress={() => handleConfirm(confirm)(code)}
                                title={t('Confirm Code')}
                            />
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <ConfirmButton
                                outlined={true}
                                style={styles.confirmButton}
                                onPress={() => {
                                    setSafeConfirm();
                                    setCode('');
                                }}
                                title={t('Try a different number')}
                            />
                        </View>
                    </>
                ),
                <>
                    <View style={{flexDirection: 'row', height: 70}}>
                        <PhoneInput
                            ref={phoneInputRef}
                            defaultValue={unformattedPhoneNumber}
                            defaultCode={countryCode}
                            layout="first"
                            // onChangeText={(text) => {
                            //     setPhoneNumber(text);
                            // }}
                            flagButtonStyle={{
                                backgroundColor: 'transparent',
                            }}
                            containerStyle={styles.phoneInput}
                            textContainerStyle={{
                                backgroundColor: 'transparent',
                                paddingVertical: 0,
                                paddingHorizontal: 0,
                            }}
                            textInputStyle={{
                                height: '100%',
                                paddingVertical: 0,
                                color: '#FFF',
                            }}
                            //@ts-ignore
                            renderDropdownImage={
                                <Icon
                                    // style={styles.icon}
                                    name="chevron-down"
                                    size={16}
                                    color={'#FFF'}
                                />
                            }
                            textInputProps={{
                                placeholderTextColor: '#fff',
                            }}
                            codeTextStyle={{color: '#fff'}}
                            onChangeText={(text) => {
                                setUnformattedPhoneNumber(text);
                            }}
                            placeholder={t('Phone Number')}
                            onChangeFormattedText={(text) => {
                                setPhoneNumber(text);
                                setCountryCode(
                                    phoneInputRef.current?.getCountryCode() ??
                                        'DK',
                                );
                            }}
                            withDarkTheme
                        />
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <ConfirmButton
                            style={styles.confirmButton}
                            onPress={handlePhone}
                            title={t('Continue')}
                        />
                    </View>
                </>,
            )}
        </Condition>
    );
};

const styles = StyleSheet.create({
    title: {textAlign: 'center', fontSize: 30},
    codeFieldRoot: {
        marginTop: 20,
        width: '100%',
        justifyContent: 'space-evenly',
    },
    cell: {
        width: 40,
        height: 60,
        lineHeight: 58,
        marginHorizontal: 5,
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
    },
    codeBottomBorder: {
        marginHorizontal: 5,
        width: 40,
        height: 1,
        backgroundColor: '#fff',
    },
    focusCell: {
        borderColor: '#fff',
    },

    phoneInput: {
        width: '100%',
        marginTop: 10,
        color: '#fff',
        paddingHorizontal: 15,
        backgroundColor: theme.BACKGROUND_COLOR,
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
        flex: 1,
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

export default PhoneAuth;
