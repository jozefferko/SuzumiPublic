import { Box, CircularProgress, NativeSelect } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import CustomModal from "../../components/CustomModal";
import { Condition, List } from "../../components/logicalLib";
import {
    ConfirmButton,
    CustomDatePicker,
    CustomField,
    CustomInput,
    CustomText,
    FlexBox,
} from "../../components/styledLib";
import {
    numberFieldHandler,
    textFieldHandler,
} from "../../utils/genericHandlers";
import { MembersPopUpProps } from "./useMembers";
import { Maybe } from "purify-ts/Maybe";
import {
    dateToFSBirthday,
    fsBirthdayToDate,
} from "../../common/utils/dateOperations";
import _ from "lodash/fp";
import { ifJustMaybe, indexArray } from "../../common/utils/fp";
import { FSTier } from "../../common/types/firestore";
import { useLocale } from "../../hooks/useLocale";
import { Indexed } from "../../common/types/misc";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";

const Container = styled(Box)`
    padding: 0 20px;
    max-width: 600px;
`;

const Label = styled(CustomText)`
    padding-top: 10px;
`;

const FlexField = styled(CustomField)`
    flex-grow: 1;
    margin-left: 10px;
`;
const GridBase = styled(Grid)`
    flex-grow: 1;
`;

const Header = styled(FlexBox)`
    margin-bottom: 10px;
`;

const CustomSelect = styled(NativeSelect)`
    min-width: 100px;
    margin: 0 0 0 10px;
`;

const TierListItem = (props: { data: Indexed<FSTier> }) => {
    const { t } = useLocale();
    return (
        <option key={props.data.index} value={props.data.index}>
            {t(props.data.displayName)}
        </option>
    );
};
const toInt = (s: string): number => parseInt(s) || 0;

const MemberEditor = (props: MembersPopUpProps) => {
    const { t } = useLocale();
    const {
        user,
        handleNewUser,
        loading,
        handleUpdateUser,
        handleDeleteUser,
        ...modalProps
    } = props;
    const tiers = useSelector(
        (state: RootState) => state.restaurant?.tiers.tiers ?? []
    );
    const indexedTiers = useMemo(() => indexArray(tiers), [tiers]);
    const [displayName, setDisplayName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [birthday, setBirthday] = useState<Date | undefined>();
    const [balance, setBalance] = useState<string>("");
    const [currentTier, setCurrentTier] = useState<number>(0);

    useEffect(() => {
        if (modalProps.open) {
            setDisplayName(user?.displayName || "");
            setPhoneNumber(user?.phoneNumber || "+45");
            setEmail(user?.email || "");
            setBalance(user ? user.balance.toString() : "");
            setCurrentTier(user?.tiers.currentTier || 0);
            setBirthday(
                Maybe.fromNullable(user?.birthday)
                    .map(fsBirthdayToDate)
                    .extract()
            );
        }
    }, [modalProps.open, user]);
    const isEditing = useMemo(() => !!user, [user]);
    const tierSelectHandler = (
        event: React.ChangeEvent<{ value: unknown }>
    ) => {
        setCurrentTier(event.target.value as number);
    };

    const boundUpdateUser = () =>
        user
            ? handleUpdateUser({
                  id: user.id,
                  ...(displayName !== user.displayName
                      ? { displayName }
                      : undefined),
                  ...(email !== user.email ? { email } : undefined),
                  ...(phoneNumber !== user.phoneNumber
                      ? { phoneNumber }
                      : undefined),
                  ...Maybe.fromNullable(birthday)
                      .map(dateToFSBirthday)
                      .filter((b) => !_.isEqual(b, user.birthday))
                      .map(($) => ({ birthday: $ }))
                      .extract(),
                  ...(balance !== user.balance.toString()
                      ? { balance: toInt(balance) }
                      : undefined),
                  ...(currentTier !== user.tiers.currentTier
                      ? { tier: currentTier }
                      : undefined),
              })
            : undefined;
    return (
        <CustomModal {...modalProps}>
            <Container>
                <GridBase container spacing={3}>
                    <Grid item xs={12}>
                        <Header flexDirection="column">
                            <CustomText fontWeight={500} variant={"h5"}>
                                {user ? t("Edit user") : t("Add new user")}
                            </CustomText>
                            <CustomText fontWeight={400} variant={"subtitle1"}>
                                {isEditing
                                    ? t("Edit user data and click save")
                                    : t("Input user data to add it")}
                            </CustomText>
                        </Header>
                    </Grid>

                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Title")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <FlexField
                                value={phoneNumber}
                                onChange={textFieldHandler(setPhoneNumber)}
                            />
                        </FlexBox>
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Name")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <FlexField
                                value={displayName}
                                onChange={textFieldHandler(setDisplayName)}
                            />
                        </FlexBox>
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Email")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <FlexField
                                value={email}
                                onChange={textFieldHandler(setEmail)}
                            />
                        </FlexBox>
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Birthday")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <CustomDatePicker
                                selected={birthday}
                                onChange={_.flow(
                                    Maybe.fromNullable,
                                    ifJustMaybe(setBirthday)
                                )}
                            />
                        </FlexBox>
                    </Grid>
                    <Condition value={isEditing}>
                        <>
                            <Grid item xs={3}>
                                <Label
                                    fontWeight={500}
                                    opacity={0.7}
                                    variant={"body2"}
                                >
                                    {t("Balance")}
                                </Label>
                            </Grid>
                            <Grid item xs={9}>
                                <FlexBox flexDirection="row">
                                    <FlexField
                                        value={balance}
                                        onChange={numberFieldHandler(
                                            setBalance
                                        )}
                                    />
                                </FlexBox>
                            </Grid>
                            <Grid item xs={3}>
                                <Label
                                    fontWeight={500}
                                    opacity={0.7}
                                    variant={"body2"}
                                >
                                    {t("Tier")}
                                </Label>
                            </Grid>
                            <Grid item xs={9}>
                                <FlexBox flexDirection="row">
                                    <CustomSelect
                                        value={currentTier}
                                        input={<CustomInput />}
                                        onChange={tierSelectHandler}
                                    >
                                        <List
                                            childProps={{}}
                                            data={indexedTiers}
                                            component={TierListItem}
                                        />
                                    </CustomSelect>
                                </FlexBox>
                            </Grid>
                        </>
                        <></>
                    </Condition>
                    <Grid item xs={12}>
                        <FlexBox
                            justifyContent={"flex-end"}
                            flexDirection="row"
                        >
                            <Condition value={loading}>
                                <CircularProgress />
                                <Condition value={isEditing}>
                                    <>
                                        <ConfirmButton
                                            onClick={() =>
                                                user
                                                    ? handleDeleteUser({
                                                          id: user.id,
                                                      })
                                                    : null
                                            }
                                        >
                                            {t("Delete")}
                                        </ConfirmButton>
                                        <Box width={"20px"} />
                                        <ConfirmButton
                                            onClick={boundUpdateUser}
                                        >
                                            {t("Save")}
                                        </ConfirmButton>
                                    </>

                                    <ConfirmButton
                                        onClick={() =>
                                            handleNewUser({
                                                displayName,
                                                email,
                                                phoneNumber,
                                                birthday: Maybe.fromNullable(
                                                    birthday
                                                )
                                                    .map(dateToFSBirthday)
                                                    .extract(),
                                            })
                                        }
                                    >
                                        {t("Add")}
                                    </ConfirmButton>
                                </Condition>
                            </Condition>
                        </FlexBox>
                    </Grid>
                </GridBase>
            </Container>
        </CustomModal>
    );
};

export default MemberEditor;
