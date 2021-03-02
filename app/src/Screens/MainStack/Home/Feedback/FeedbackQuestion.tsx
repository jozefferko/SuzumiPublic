import React, {useMemo} from 'react';
import {
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
} from 'react-native';
import {useLocale} from '../../../../hooks/useLocale';
import theme from '../../../../assets/theme.style';
import {Maybe} from 'purify-ts';
import {FSLocaleString} from '../../../../common/types/firestore';
import {SvgXml} from 'react-native-svg';
import {getLikeSVG} from '../../../../assets/svgs';
import _ from 'lodash/fp';
import {trigger} from '../../../../common/utils/fp';
import ConfirmButton from '../../../../components/ConfirmButton';

export type FeedbackQuestionProps = {
    setValue: (a: boolean) => any;
    value: Maybe<boolean>;
    label: FSLocaleString;
};

const FeedbackQuestion = (props: FeedbackQuestionProps) => {
    // const [show, setShow] = useState(props.data.isJust());
    const {t} = useLocale();
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{t(props.label)}</Text>
            <View style={styles.buttons}>
                <TouchableOpacity
                    onPress={trigger(props.setValue)(true)}
                    style={styles.button}>
                    <SvgXml
                        xml={getLikeSVG(props.value.orDefault(false))}
                        height="30"
                        width="30"
                        preserveAspectRatio="xMidYMid meet"
                    />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity
                    onPress={trigger(props.setValue)(false)}
                    style={[styles.button, {transform: [{rotate: '180deg'}]}]}>
                    <SvgXml
                        xml={getLikeSVG(
                            props.value.mapOrDefault<boolean>(($) => !$, false),
                        )}
                        height="30"
                        width="30"
                        preserveAspectRatio="xMidYMid meet"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: '#FFF',
    },
    buttons: {
        marginTop: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        flexDirection: 'row',
    },
    divider: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        width: 1,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        flex: 1,
        // backgroundColor: '#f0f',
    },
    //old
    content: {
        backgroundColor: '#FFF',
        flexDirection: 'column',
        margin: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        padding: 30,
        paddingBottom: theme.padding,
    },
    title: {
        width: 190,
        textAlign: 'left',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
    },
    header: {
        textAlign: 'left',
        fontSize: 17,
        paddingBottom: 10,
        fontFamily: 'Roboto-Medium',
        color: theme.BACKGROUND_COLOR,
    },
    text: {
        textAlign: 'left',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
        paddingBottom: 20,
    },
    input: {
        borderRadius: 5,
        backgroundColor: 'transparent',
        fontFamily: 'Roboto-light',
        fontSize: 13,
        color: '#FFF',
        paddingLeft: 0,
        paddingVertical: 12,
        paddingBottom: 12,
    },
});

export default FeedbackQuestion;
