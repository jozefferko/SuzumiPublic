import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {
    bookingSvg,
    spendPointsSvg,
    tiersHelpSvg,
} from '../../../../assets/svgs';
import theme from '../../../../assets/theme.style';
import CustomModal from '../../../../components/CustomModal';
import {Condition} from '../../../../components/logicalLib';
import Slider from '../../../../components/Slider';
import {useLocale} from '../../../../hooks/useLocale';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../redux';

type props = {
    show: boolean;
    onClose: () => any;
    tiers: boolean;
};
const HelpModal = (props: props) => {
    const {t} = useLocale();
    const conversionRate = useSelector(
        (state: RootState) => state.restaurant?.conversionRate ?? 0,
    );
    const months = useSelector(
        (state: RootState) => state.restaurant?.expiry.expire.months,
    );
    return (
        <CustomModal height={'90%'} show={props.show} onClose={props.onClose}>
            <Condition if={props.tiers}>
                <Slider onFinish={props.onClose}>
                    <View style={styles.content2}>
                        <View style={styles.icon}>
                            <SvgXml
                                xml={bookingSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </View>
                        <Text style={styles.title}>
                            {t('Earn points for enjoying sushi')}
                        </Text>
                        <Text style={styles.description}>
                            {t(
                                'Before you pay for your meal at Suzumi, present your unique QR code to the cashier to collect your points. You get {{rate}} points for every 100 kr. spent. You also earn bonus points for completing achievements.',
                                {rate: conversionRate * 100},
                            )}
                        </Text>
                    </View>
                    <View style={styles.content2}>
                        <View style={styles.icon}>
                            <SvgXml
                                xml={tiersHelpSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </View>
                        <Text style={styles.title}>
                            {t('Climb tiers for better benefits')}
                        </Text>
                        <Text style={styles.description}>
                            {t(
                                'Earn the required amount of points to progress to the next tier. The higher the tier, the better the benefits! Your tier will be maintained for {{months}} months as long as you have been earning or spending points in this period.',
                                {months},
                            )}
                        </Text>
                    </View>
                    <View style={styles.content2}>
                        <View style={styles.icon}>
                            <SvgXml
                                xml={spendPointsSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </View>
                        <Text style={styles.title}>
                            {t('Spend your points for discount and rewards')}
                        </Text>
                        <Text style={styles.description}>
                            {t(
                                'Redeem your points for exciting discounts and rewards to personalize your Suzumi experience!',
                            )}
                        </Text>
                    </View>
                </Slider>
                <Slider onFinish={props.onClose}>
                    <View style={styles.content2}>
                        <View style={styles.icon}>
                            <SvgXml
                                xml={bookingSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </View>
                        <Text style={styles.title}>
                            {t('Earn points for enjoying sushi')}
                        </Text>
                        <Text style={styles.description}>
                            {t(
                                'Before you pay for your meal at Suzumi, present your unique QR code to the cashier to collect your points. You get 100 points for every 100 kr. spent. You also earn bonus points for completing achievements. ',
                            )}
                        </Text>
                    </View>
                    <View style={styles.content2}>
                        <View style={styles.icon}>
                            <SvgXml
                                xml={spendPointsSvg}
                                height="100%"
                                width="100%"
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </View>
                        <Text style={styles.title}>
                            {t('Spend your points for discount and rewards')}
                        </Text>
                        <Text style={styles.description}>
                            {t(
                                'Redeem your points for exciting discounts and rewards to personalize your Suzumi experience!',
                            )}
                        </Text>
                    </View>
                </Slider>
            </Condition>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 33,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 29,
        fontFamily: 'Roboto-Medium',
    },

    phoneNumber: {
        marginBottom: 20,
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Roboto-Light',
    },
    content2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.padding,
        marginBottom: 60,
    },
    icon: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontFamily: 'Roboto-Medium',
        marginVertical: 20,
        textAlign: 'center',
    },
    description: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
    },
});

export default HelpModal;
