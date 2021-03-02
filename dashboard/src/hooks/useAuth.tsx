import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../firebase";
import { setAuthFlowError } from "../redux/authFlowSlice";

export type phoneConfirm = (arg: string) => void;

//TODO: MAKE THESE USECALLBACK
export const useAuth = () => {
    const d = useDispatch();
    const authError = useCallback(
        (type: string, message: string) => {
            d(setAuthFlowError({ type: type, message: message }));
        },
        [d]
    );

    const signInWithEmailAndPassword = useCallback(
        (email: string, password: string) => {
            auth.signInWithEmailAndPassword(email, password).catch((error) => {
                console.log(error);
                switch (error.code) {
                    case "auth/invalid-email":
                        authError(
                            "signInWithEmailAndPassword",
                            "Invalid email address."
                        );
                        break;
                    case "auth/user-disabled":
                        authError(
                            "signInWithEmailAndPassword",
                            "This account has been disabled."
                        );
                        break;
                    case "auth/user-not-found":
                    case "auth/wrong-password":
                        authError(
                            "signInWithEmailAndPassword",
                            "Please check your email and password."
                        );
                        break;
                    default:
                        authError("signInWithEmailAndPassword", "Login failed");
                }
            });
        },
        [authError]
    );

    const signOut = useCallback(() => {
        auth.signOut().catch(console.log);
    }, []);
    return {
        signInWithEmailAndPassword,
        signOut,
    };
};
