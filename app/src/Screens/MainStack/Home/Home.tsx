import {useIsFocused, useNavigation} from '@react-navigation/native';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts/Maybe';
import React, {useContext, useEffect, useState} from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {HeaderAnimContext} from '../../../App';
import {banner, defaultProfile, suzumiText} from '../../../assets/staticImages';
import {
    achievementsSVG,
    bookingSvg,
    feedbackSvg,
    rewardsSvg,
    takeawaySvg,
    transactionsSvg,
} from '../../../assets/svgs';
import theme from '../../../assets/theme.style';
import {FSPathMap} from '../../../common/types/firestore';
import {formatFSTimestamp} from '../../../common/utils/dateOperations';
import {serverTimestamp} from '../../../common/utils/firestore/normalize';
import {
    fsDelete,
    fsFieldValue,
    fsUpload,
    fsUploadType,
} from '../../../common/utils/firestore/queries';
import {FieldValue} from '../../../commonDefs/definitions';
import {Condition} from '../../../components/logicalLib';
import {useLocale} from '../../../hooks/useLocale';
import {RootState} from '../../../redux';
import {
    achievementsAchieved,
    claimedRewardsCount,
    feedbackShown,
    unclaimedAchievements,
    unclaimedRewards,
    useSafeSelector,
} from '../../../redux/selectors';
import {setSettings} from '../../../redux/settingsSlice';
import {loadedState, UserStatus} from '../../../redux/userSlice';
import {HeaderAnimEnableContext} from '../../Screens';
import Card from './Card';
import ExpiryModal from './ExpiryModal';
import HelpModal from './HelpModal';
import QrCodeModal from './QrCodeModal';
import TierSection from './TierSection';
import {
    createFSUser,
    createUserDoc,
} from '../../../common/utils/firestore/userOperations';
import CodePush from 'react-native-code-push';
import codePush from 'react-native-code-push';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const hackHeight = (Dimensions.get('window').width / 2359) * 1263;
const AnimatedStatusBar = Animated.createAnimatedComponent(StatusBar);

type props = {};

const codepushProgress = [
    'UP_TO_DATE',

    'UPDATE_INSTALLED',

    'UPDATE_IGNORED',

    'UNKNOWN_ERROR',

    'SYNC_IN_PROGRESS',

    'CHECKING_FOR_UPDATE',

    'AWAITING_USER_ACTION',

    'DOWNLOADING_PACKAGE',

    'INSTALLING_UPDATE',
];

const Home = (props: props) => {
    // const {t} = useLocale();
    const {t, i18n} = useTranslation();
    console.log('d');
    const d = useDispatch();
    const navigation = useNavigation();

    const barColorAnim = useContext(HeaderAnimContext);
    const setAnim = useContext(HeaderAnimEnableContext);
    const isFocused = useIsFocused();
    useEffect(() => {
        setAnim(isFocused);
    }, [isFocused, setAnim]);
    const barColor = barColorAnim.interpolate({
        inputRange: [0, 200],
        outputRange: ['#2C3042', '#1C1F2A'],
        extrapolate: 'clamp',
    });
    const heroOpacity = barColorAnim.interpolate({
        inputRange: [20, 350],
        outputRange: [1, 0],
        extrapolate: 'clamp',
        easing: Easing.out(Easing.exp),
    });
    const [modal, modalSetter] = useState(false);
    const [expiryModal, setExpiryModal] = useState(false);

    const [helpModal, setHelpModal] = useState(false);
    const firstOpen = useSelector(
        (state: RootState) => state.settings?.firstOpen,
    );
    useEffect(() => {
        if (Maybe.fromNullable(firstOpen).orDefault(true)) {
            setHelpModal(true);
        }
    }, [firstOpen]);
    const onHelpModalClose = () => {
        if (firstOpen) {
            d(setSettings({firstOpen: false}));
        }
        setHelpModal(false);
    };
    const safeUser = useSafeSelector<loadedState>((state) =>
        state.user.status === UserStatus.loaded ? state.user : null,
    );

    //Dynamic cards
    const claimedRewards = useSelector(claimedRewardsCount());
    const achievementsCount = useSelector(achievementsAchieved());
    const lastTransaction = useSelector(
        (state: RootState) => Object.values(state.transactions)[0]?.amount ?? 0,
    );
    const showRewardsBadge = useSelector(unclaimedRewards());
    const showAchievementsBadge = useSelector(unclaimedAchievements());
    const tiersEnabled: boolean = useSelector(
        (state: RootState) => state.restaurant?.tiers.enabled ?? false,
    );
    const transactions = useSelector((state: RootState) => state.transactions);
    const [codePushLog, setCodePushLog] = useState<string>('');
    const feedbackEnabled = useSelector(feedbackShown());
    return (
        <View style={{flex: 1, overflow: 'visible'}}>
            {isFocused ? (
                <AnimatedStatusBar
                    barStyle="light-content"
                    backgroundColor={barColor}
                    // backgroundColor="transparent"
                    // translucent={true}
                />
            ) : null}

            <Animated.View
                style={{
                    justifyContent: 'space-between',
                    paddingTop: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingBottom: 10,
                    backgroundColor: barColor,
                }}>
                <View style={styles.logoContainer}>
                    <FastImage
                        source={suzumiText}
                        resizeMode="contain"
                        style={styles.suzumi}
                    />
                </View>
                {safeUser.mapOrDefault(
                    (user) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('profile')}>
                            <FastImage
                                source={
                                    user.photoUrl
                                        ? {uri: user.photoUrl}
                                        : defaultProfile
                                }
                                resizeMode="cover"
                                style={styles.userImage}
                            />
                        </TouchableOpacity>
                    ),
                    null,
                )}
                <View style={styles.cornerButtonsBox}>
                    {/*<TouchableOpacity*/}
                    {/*    style={styles.cornerButton}*/}
                    {/*    onPress={() => setHelpModal(true)}>*/}
                    {/*    <Icon*/}
                    {/*        name="help-circle-outline"*/}
                    {/*        size={29}*/}
                    {/*        color="#9698A1"*/}
                    {/*    />*/}
                    {/*</TouchableOpacity>*/}
                    <TouchableOpacity
                        style={{
                            ...styles.cornerButton,
                            paddingRight: theme.padding,
                        }}
                        onPress={() => navigation.navigate('settings')}>
                        <Icon name="cog" size={29} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: barColorAnim}}}],
                    {useNativeDriver: false},
                )}
                overScrollMode={'never'}
                style={styles.wrapper}>
                <Animated.View style={{opacity: heroOpacity}}>
                    <FastImage
                        style={styles.banner}
                        source={banner}
                        resizeMode="contain"
                    />
                </Animated.View>
                <View style={styles.content}>
                    <View style={styles.balanceBox}>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={styles.balanceHeader}>
                                {t('Your Balance')}
                            </Text>
                            <Text style={styles.points}>
                                {safeUser.mapOrDefault(
                                    ($) => $.balance.toString(),
                                    '',
                                )}
                                <Text style={styles.pointsLabel}>
                                    {' ' + t('points')}
                                </Text>
                            </Text>
                            <TouchableOpacity
                                onPress={() => setExpiryModal(true)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <Text style={styles.expireLabel}>
                                    {t('Expire {{- date}}', {
                                        date: safeUser.mapOrDefault(
                                            _.flow(
                                                ($) => $.expiryDate,
                                                formatFSTimestamp,
                                            ),
                                            '',
                                        ),
                                    })}
                                </Text>
                                <Icon
                                    style={{paddingLeft: 5}}
                                    name="information"
                                    size={13}
                                    color="#828386"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'column'}}>
                            <Condition
                                if={safeUser
                                    .filter(
                                        ($) => $.tiers.enabled && tiersEnabled,
                                    )
                                    .isNothing()}>
                                <TouchableOpacity
                                    style={styles.qrCodeButton}
                                    onPress={() => modalSetter(true)}>
                                    <MaterialIcon
                                        name="qr-code"
                                        size={44}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>
                                <></>
                            </Condition>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    {safeUser
                        .filter(($) => $.tiers.enabled && tiersEnabled)
                        .mapOrDefault(
                            (user) => (
                                <TierSection user={user} />
                            ),
                            null,
                        )}
                    <Condition if={feedbackEnabled}>
                        <Card
                            label={t('leave feedback')}
                            description={t(
                                'Let us know how your dine-in experience with Suzumi was',
                            )}
                            badge={true}
                            onPress={() => navigation.navigate('feedback')}>
                            <View style={{flex: 1, padding: 20}}>
                                <SvgXml
                                    xml={feedbackSvg}
                                    height="100%"
                                    width="100%"
                                    preserveAspectRatio="xMaxYMax meet"
                                />
                            </View>
                        </Card>
                        <></>
                    </Condition>
                    <Card
                        label={t('coupons')}
                        description={t(`rewardsClaimed`, {
                            count: claimedRewards,
                        })}
                        onPress={() => navigation.navigate('rewards')}
                        badge={showRewardsBadge}>
                        <View style={{flex: 1, padding: 0}}>
                            <SvgXml
                                xml={rewardsSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMaxYMax meet"
                            />
                        </View>
                    </Card>
                    <Card
                        label={t('achievements')}
                        description={t('{{count}} completed', {
                            count: achievementsCount,
                        })}
                        onPress={() => navigation.navigate('achievements')}
                        badge={showAchievementsBadge}>
                        <View style={{flex: 1, padding: 0}}>
                            <SvgXml
                                xml={achievementsSVG}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMaxYMax meet"
                            />
                        </View>
                    </Card>
                    {/*<Card*/}
                    {/*    label="Refer a friend"*/}
                    {/*    description="You referred 2 friends"*/}
                    {/*    onPress={() => console.log('button')}>*/}
                    {/*    <View*/}
                    {/*        style={{*/}
                    {/*            flex: 1,*/}
                    {/*            paddingRight: 5,*/}
                    {/*            paddingBottom: 5,*/}
                    {/*        }}>*/}
                    {/*        <SvgXml*/}
                    {/*            xml={referralsSvg}*/}
                    {/*            height="100%"*/}
                    {/*            width="100%"*/}
                    {/*            preserveAspectRatio="xMaxYMax meet"*/}
                    {/*        />*/}
                    {/*    </View>*/}
                    {/*</Card>*/}
                    <Card
                        label={t('transactions')}
                        description={
                            t('Recent') +
                            ': ' +
                            t(`{{points}} points`, {
                                points:
                                    (lastTransaction < 0 ? '-' : '+') +
                                    ' ' +
                                    Math.abs(lastTransaction).toString(),
                            })
                        }
                        onPress={() => navigation.navigate('transactions')}>
                        <View style={{flex: 1, padding: 20}}>
                            <SvgXml
                                xml={transactionsSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMaxYMax meet"
                            />
                        </View>
                    </Card>
                    <Card
                        label={t('book table')}
                        description={t(
                            'Eat at Suzumi and exchange your spending for points',
                        )}
                        onPress={() => navigation.navigate('booking')}>
                        <View style={{flex: 1, padding: 0}}>
                            <SvgXml
                                xml={bookingSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMaxYMax meet"
                            />
                        </View>
                    </Card>
                    <Card
                        label={t('order takeaway')}
                        description={t(
                            'Order and enjoy Suzumi from the comfort of your home',
                        )}
                        onPress={() => navigation.navigate('takeaway')}>
                        <View
                            style={{
                                flex: 1,
                                paddingRight: 5,
                                paddingBottom: 5,
                            }}>
                            <SvgXml
                                xml={takeawaySvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMaxYMax meet"
                            />
                        </View>
                    </Card>
                    <Card
                        label="GET POINTES"
                        description={
                            'FOR TESTING, will give 200 points when pressed'
                        }
                        onPress={() =>
                            safeUser.ifJust((u) => {
                                fsUpload({
                                    path: FSPathMap.users.doc(u.id),
                                    type: fsUploadType.update,
                                    data: {
                                        balance: fsFieldValue(
                                            FieldValue.increment(200),
                                        ),
                                    },
                                });

                                fsUpload({
                                    path: FSPathMap.transactions,
                                    type: fsUploadType.set,
                                    data: {
                                        id: '',
                                        amount: 200,
                                        user: u.id,
                                        ref: '',
                                        plainRef: {
                                            en: 'Testing',
                                            dk: 'Testing på dansk',
                                        },
                                        type: 'correction',
                                        timestamp: serverTimestamp(),
                                    },
                                });
                            })
                        }>
                        <View
                            style={{
                                flex: 1,
                                paddingRight: 5,
                                paddingBottom: 5,
                            }}
                        />
                    </Card>

                    <Card
                        label="FORCE UPDATE"
                        description={codePushLog}
                        onPress={() => {
                            setCodePushLog('');
                            CodePush.sync(
                                {
                                    installMode: codePush.InstallMode.IMMEDIATE,
                                },
                                (status) =>
                                    setCodePushLog(
                                        (s) =>
                                            s + '\n' + codepushProgress[status],
                                    ),
                            );
                        }}>
                        <View
                            style={{
                                flex: 1,
                                paddingRight: 5,
                                paddingBottom: 5,
                            }}
                        />
                    </Card>
                </View>
                {safeUser.mapOrDefault(
                    (user) => (
                        <>
                            <QrCodeModal
                                user={user}
                                show={modal}
                                onClose={() => modalSetter(false)}
                            />
                            <ExpiryModal
                                user={user}
                                show={expiryModal}
                                onClose={() => setExpiryModal(false)}
                            />
                            <HelpModal
                                tiers={user.tiers.enabled && tiersEnabled}
                                show={helpModal}
                                onClose={onHelpModalClose}
                            />
                        </>
                    ),
                    null,
                )}
            </Animated.ScrollView>
            <Condition
                if={safeUser
                    .filter(($) => $.tiers.enabled && tiersEnabled)
                    .isJust()}>
                <TouchableOpacity
                    style={styles.floatingQrCodeButton}
                    onPress={() => modalSetter(true)}>
                    <MaterialIcon name="qr-code" size={54} color="#FFFFFF" />
                    <Text style={styles.floatingQrText}>{t('Show scan')}</Text>
                </TouchableOpacity>
                <></>
            </Condition>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.BACKGROUND_COLOR,
    },
    header: {
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingLeft: theme.padding,
        alignItems: 'center',
        flexDirection: 'row',
        paddingBottom: 10,
    },
    userImage: {
        marginLeft: theme.padding,
        borderRadius: 100,
        height: 39,
        width: 39,
    },
    logoContainer: {
        position: 'absolute',
        width: '100%',
        top: 12,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cornerButtonsBox: {
        flexDirection: 'row',
        height: '100%',
    },
    cornerButton: {
        height: '100%',
        paddingHorizontal: 4,
    },
    suzumi: {
        width: 100,
        height: 26,
    },
    banner: {
        width: '100%',
        height: hackHeight,
    },
    balanceBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    content: {
        padding: theme.padding,
    },
    balanceHeader: {
        color: '#999999',
        fontSize: 14,
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Medium',
        paddingBottom: 10,
    },
    points: {
        color: '#FFFFFF',
        fontSize: 48,
        fontFamily: 'Roboto-Medium',
    },
    pointsLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
    },
    expireLabel: {
        color: '#999999',
        fontSize: 13,
        fontFamily: 'Roboto-Light',
    },
    qrCodeButton: {
        padding: 7,
        backgroundColor: theme.HIGHLIGHT,
        borderRadius: 5,
    },
    floatingQrCodeButton: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        paddingTop: 2,
        backgroundColor: theme.HIGHLIGHT,
        borderRadius: 5,
        position: 'absolute',
        bottom: 40,
        right: 20,
        //shadow
        shadowColor: theme.HIGHLIGHT,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    floatingQrText: {
        color: '#ffffff',
        fontSize: 11,
        fontFamily: 'Roboto-Light',
    },
    divider: {
        marginVertical: 25,
        height: 1,
        backgroundColor: '#373B4C',
    },

    button: {
        height: 50,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        flex: 1,
        padding: 10,
    },
    swoop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        margin: 10,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    gridRow: {
        justifyContent: 'space-evenly',
    },
    scrollView: {
        backgroundColor: 'rgb(242,242,242)',
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    linearGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        aspectRatio: 1.618,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,

        elevation: 8,
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
});

export default Home;
