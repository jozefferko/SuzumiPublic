import {Maybe} from 'purify-ts';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import {SvgXml} from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    bronzeShieldSvg,
    goldShieldSvg,
    silverShieldSvg,
} from '../../../../assets/achievementSvgs';
import theme from '../../../../assets/theme.style';
import {Condition} from '../../../../components/logicalLib';
import {useLocale} from '../../../../hooks/useLocale';
import {Achievement} from '../../../../redux/selectors';
import {getIconSVG} from './AchievementCard';

type props = {
    onClose: () => any;
    achievement: Maybe<Achievement>;
};

const backgroundSvg: {[id: number]: string} = {
    2: bronzeShieldSvg,
    1: silverShieldSvg,
    0: goldShieldSvg,
};

const Icons: {[id: number]: React.ReactNode} = {
    0: <Icon name="trophy-award" size={45} color="#FFFFFF" />,
};

const UnlockTiersPopUpContent = (props: {
    onClose: () => any;
    achievement: Achievement;
}) => {
    const {t} = useLocale();
    return (
        <View style={styles.content}>
            <Pressable onPress={props.onClose} style={styles.closeIcon}>
                <Icon name="close" size={25} color="#A1A1A1" />
            </Pressable>
            <Text style={styles.header}>{t('Achievement details')}</Text>

            <View style={styles.shieldContainer}>
                <SvgXml
                    xml={backgroundSvg[props.achievement.tier]}
                    height="100%"
                    width="100%"
                    preserveAspectRatio="xMidYMid meet"
                />
                <View style={styles.iconContainer}>
                    <SvgXml
                        xml={getIconSVG(props.achievement.id)}
                        height="100%"
                        width="100%"
                        preserveAspectRatio="xMidYMid meet"
                    />
                </View>
            </View>
            <Text style={styles.title}>{t(props.achievement.description)}</Text>
            <Condition if={!props.achievement.claimed}>
                <Text style={styles.title}>
                    {`(${props.achievement.progress}/${props.achievement.goal})`}
                </Text>
                <></>
            </Condition>

            {props.achievement.claimed ? (
                <Text style={styles.text}>
                    {t(
                        'Achievement completed! achievements can be seen on the main screen',
                    )}
                </Text>
            ) : (
                <Text style={styles.text}> </Text>
            )}
        </View>
    );
};
const UnlockTiersPopUp = (props: props) => {
    const [show, setShow] = useState(props.achievement.isJust());
    useEffect(() => setShow(props.achievement.isJust()), [props.achievement]);

    const close = () => setShow(false);
    return (
        <Modal
            // deviceWidth={deviceWidth}
            // deviceHeight={deviceHeight}
            propagateSwipe
            backdropTransitionOutTiming={0}
            isVisible={show}
            onSwipeComplete={close}
            swipeDirection="down"
            onBackdropPress={close}
            onModalHide={props.onClose}
            style={{justifyContent: 'center', margin: 0}}>
            {props.achievement.mapOrDefault(
                (achievement) => (
                    <UnlockTiersPopUpContent
                        onClose={close}
                        achievement={achievement}
                    />
                ),
                <View />,
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    content: {
        backgroundColor: theme.BACKGROUND_COLOR,

        margin: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    contentTitle: {
        fontSize: 20,
        marginBottom: 12,
    },
    shieldContainer: {
        width: '100%',
        height: 140,
        marginTop: 25,
        marginBottom: 20,
    },
    iconContainer: {
        position: 'absolute',
        top: 25,
        width: '100%',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        width: 190,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: '#FFF',
    },
    header: {
        textAlign: 'center',
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
        color: '#FFF',
    },
    text: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: '#FFF',
        padding: 40,
    },
    highlighted: {
        fontFamily: 'Roboto-Medium',
        color: '#FFAF47',
    },
    closeIcon: {alignSelf: 'flex-end', padding: 10},
    icon: {
        alignSelf: 'center',
    },
});

export default UnlockTiersPopUp;
