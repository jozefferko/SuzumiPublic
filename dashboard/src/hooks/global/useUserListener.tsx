import _ from "lodash/fp";
import { Maybe } from "purify-ts";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { FSRole } from "../../common/types/firestore";
import { fromThrowableC, tapLog } from "../../common/utils/fp";
import { auth } from "../../firebase";
import { clearUser, setUserID } from "../../redux/userSlice";
import { useAuth } from "../useAuth";

export default () => {
    const d = useDispatch();
    const { signOut } = useAuth();

    useEffect(
        () =>
            auth.onAuthStateChanged((user) =>
                Maybe.fromNullable(user)
                    .ifJust((u) =>
                        u
                            .getIdTokenResult()
                            .then((token) => {
                                console.log(token);
                                Maybe.fromPredicate(
                                    (o) => "role" in o,
                                    token.claims
                                )
                                    .chain(
                                        _.flow(
                                            ($) => $["role"],
                                            fromThrowableC(FSRole.check)
                                        )
                                    )
                                    .ifJust(
                                        _.flow(
                                            (role) => ({
                                                id: u.uid,
                                                email: u.email || "",
                                                role: role,
                                            }),
                                            setUserID,
                                            d
                                        )
                                    )
                                    .ifNothing(signOut);
                            })
                            .catch(console.log)
                    )
                    .ifNothing(() => {
                        d(clearUser());
                    })
            ),
        [d, signOut]
    );
};
