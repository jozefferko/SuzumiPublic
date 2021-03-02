import React from 'react';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {achievementIndexes} from '../../../../common/types/firestore';
import {useLocale} from '../../../../hooks/useLocale';
import {useSafeState} from '../../../../hooks/useSafeState';
import {Achievement, achievementsSelector} from '../../../../redux/selectors';
import AchievementCard from './AchievementCard';
import AchievementPopUp from './AchievementPopUP';
import UnlockTiersPopUp from './UnlockTiersPopUp';

const Achievements = () => {
    const {t} = useLocale();
    const achievements: Achievement[] = useSelector(achievementsSelector());
    const [popUp, setPopUp] = useSafeState<Achievement>();
    const [tiersPopUp, setTiersPopUp] = useSafeState<Achievement>();
    // const offersArray = useMemo<Static<typeof FSOffer>[]>(
    //     () => Object.values(offersData),
    //     [offersData],
    // );
    // cons user
    // const handlePress = (achievement:Achievement)=>achievement.progress===achievement.goal?fsRunTransaction(transaction => transaction.update(FSPathMap.)):setPopUp(achievement)

    const renderItem: ListRenderItem<Achievement> = ({item}) => (
        <AchievementCard
            onPress={
                item.id === achievementIndexes.unlockTiers
                    ? setTiersPopUp
                    : setPopUp
            }
            item={item}
        />
    );
    return (
        <View style={{flex: 1, paddingHorizontal: theme.padding}}>
            <View style={styles.separator} />
            {/*<ScrollView style={styles.wrapper}>*/}
            {achievements ? (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    style={styles.list}
                    renderItem={renderItem}
                    data={achievements}
                    keyExtractor={(item) => item.id.toString()}
                    columnWrapperStyle={{justifyContent: 'space-evenly'}}
                    contentContainerStyle={{paddingVertical: 30}}

                    // columnWrapperStyle={styles.gridRow}
                />
            ) : null}
            {/*</ScrollView>*/}
            <AchievementPopUp onClose={() => setPopUp()} achievement={popUp} />
            <UnlockTiersPopUp
                onClose={() => setTiersPopUp()}
                achievement={tiersPopUp}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    list: {
        // paddingTop: 50,
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
    },
    header: {
        marginVertical: 40,
        color: '#ffffff',
        fontSize: 25,
        fontFamily: 'Roboto-Medium',
    },
    wrapper: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        paddingTop: theme.padding,
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default Achievements;
