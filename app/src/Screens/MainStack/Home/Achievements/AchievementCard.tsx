import {Maybe} from 'purify-ts';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SvgXml} from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    bronzeShieldSvg,
    goldShieldSvg,
    greyShieldSvg,
    silverShieldSvg,
} from '../../../../assets/achievementSvgs';
import {
    celebrationSvg,
    fallSeasonSvg,
    phoneSvg,
    questionMark,
    springSeasonSvg,
    summerSeasonSvg,
    winterSeasonSvg,
} from '../../../../assets/svgs';
import {achievementIndexes} from '../../../../common/types/firestore';
import {useLocale} from '../../../../hooks/useLocale';
import {Achievement} from '../../../../redux/selectors';
import {scaleHorizontal} from '../../../../utils/scale';
import {endpoint} from '../../../../utils/cloud';
import {onCallAppSignatures} from '../../../../common/types/calls';

type props = {
    item: Achievement;
    onPress: (achievement: Achievement) => any;
};

const backgroundSvg: {[id: number]: string} = {
    2: bronzeShieldSvg,
    1: silverShieldSvg,
    0: goldShieldSvg,
};

export const IconSvg: {[id: number]: string} = {
    [achievementIndexes.register]: celebrationSvg,
    [achievementIndexes.spring]: springSeasonSvg,
    [achievementIndexes.summer]: summerSeasonSvg,
    [achievementIndexes.fall]: fallSeasonSvg,
    [achievementIndexes.winter]: winterSeasonSvg,
    [achievementIndexes.eatEarly]: celebrationSvg,
    [achievementIndexes.eatWithFriends]: phoneSvg,
};
export const getIconSVG = (index: number): string =>
    Maybe.fromNullable(IconSvg[index]).orDefault(celebrationSvg);

const AchievementCard = (props: props) => {
    const {item} = props;
    const {t} = useLocale();
    if (item.displayName.en === 'Register') {
        console.log(item);
    }
    const onCardPress = () =>
        Maybe.fromPredicate(
            (i: Achievement) => !i.claimed && i.progress >= i.goal,
            item,
        ).caseOf({
            Just: (i) =>
                endpoint(onCallAppSignatures.claimAchievement)({
                    achievementID: i.id,
                }),
            Nothing: () => props.onPress(item),
        });
    return (
        <Pressable style={styles.wrapper} onPress={onCardPress}>
            <LinearGradient
                style={styles.background}
                colors={
                    !item.claimed && item.progress >= item.goal
                        ? ['#373D5A', '#565B74']
                        : ['#373B4C', '#373B4C']
                }>
                <View style={styles.shieldContainer}>
                    <SvgXml
                        xml={
                            item.claimed
                                ? goldShieldSvg
                                : !item.unlocked
                                ? greyShieldSvg
                                : backgroundSvg[item.tier + 1]
                        }
                        height="100%"
                        width="100%"
                        preserveAspectRatio="xMidYMid meet"
                    />
                    <View style={styles.iconContainer}>
                        <SvgXml
                            xml={
                                !item.unlocked
                                    ? questionMark
                                    : getIconSVG(item.id)
                            }
                            height="100%"
                            width="100%"
                            preserveAspectRatio="xMidYMid meet"
                        />
                    </View>
                </View>

                <Text style={styles.title}>{t(item.displayName)}</Text>
                <View style={{flex: 1}} />
                {item.claimed ? (
                    <Icon
                        style={styles.claimedIcon}
                        name="check"
                        size={16}
                        color="#A1A1A1"
                    />
                ) : item.progress <= 0 ? (
                    <View style={styles.noProgress} />
                ) : item.progress < item.goal ? (
                    <View style={styles.progressContainer}>
                        <View
                            style={{
                                ...styles.progress,
                                width: `${(
                                    (item.progress / item.goal) *
                                    100
                                ).toString()}%`,
                            }}
                        />
                    </View>
                ) : (
                    <Text style={styles.claim}>{t('Claim')}</Text>
                )}
            </LinearGradient>
        </Pressable>
    );
};
const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
        width: scaleHorizontal(120),
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        flex: 1,
        width: scaleHorizontal(120),
        flexDirection: 'column',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldContainer: {
        width: '100%',
        height: 110,
        marginTop: 25,
        marginBottom: 15,
    },
    iconContainer: {
        // backgroundColor: '#f0f',
        position: 'absolute',
        top: 20,
        width: '100%',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: '#FFF',
    },
    progressContainer: {
        width: '100%',
        flexDirection: 'column',
        height: 10,
        borderRadius: 50,
        marginTop: 12,
        backgroundColor: '#5F524B',
    },
    noProgress: {
        width: '100%',
        flexDirection: 'column',
        height: 10,
        borderRadius: 50,
        marginTop: 12,
    },
    progress: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: '#FFAF47',
    },
    claim: {
        textShadowColor: 'rgba(255, 175, 71, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        color: 'rgba(255, 175, 71, 1)',
        padding: 6,
        paddingTop: 12,
    },
    claimedIcon: {
        textShadowColor: 'rgba(255, 175, 71, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        fontFamily: 'Roboto-Light',
        color: 'rgba(255, 175, 71, 1)',
        padding: 6,
        paddingTop: 12,
    },
});

export default AchievementCard;
