'use client'
import {SubmitHandler, useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import SelectField from "@/components/forms/SelectField";
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/constants";
import CountrySelectorField from "@/components/forms/CountrySelectorField";
import FooterLink from "@/components/forms/FooterLink";
import {signUpWIthEmail} from "@/lib/actions/auth.actions";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

const SignUp = () => {

    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: {errors, isSubmitting},
    } = useForm<SignUpFormData>(
        {
            defaultValues: {
                fullName: "",
                email: "",
                password: "",
                country: "US",
                investmentGoals: "Growth",
                riskTolerance: "Medium",
                preferredIndustry: "Technology"
            },
            mode: "onBlur"
        },
    );

    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        try {
            const result = await signUpWIthEmail(data)
            if (result.sucess) {
                router.push("/");
            } else {
                toast.error("Sign up failed", {
                    description: result.error || "Failed to create an account"
                })
            }
        }
        catch (e) {
            console.error(e);
            toast.error("Sign up failed", {
                description: e instanceof Error ? e.message : "Failed to create an account"
            })
        }
    }

    return (
        <>
            <h1 className={"form-title"}>Sign Up & Personalize</h1>

            <form onSubmit={handleSubmit(onSubmit)} className={"space-y-5"}>
                <InputField
                    name={"fullName"}
                    label={"Full Name"}
                    placeholder={"Joao "}
                    register={register}
                    error={errors.fullName}
                    validation={{required: 'Full name is required', minLength: 2}}
                />

                <InputField
                    name={"email"}
                    label={"Email"}
                    placeholder={"joao123@gmail.com "}
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email address"
                        }
                    }}
                />

                <InputField
                    name={"password"}
                    label={"Password"}
                    placeholder={"Enter a strong password"}
                    type={"password"}
                    register={register}
                    error={errors.password}
                    validation={{
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                        }
                    }}
                />

                <CountrySelectorField
                    control={control}
                    name="country"
                    label="Country"
                    required
                />

                <SelectField
                    name={"investmentGoals"}
                    label={"Investment Goals"}
                    placeholder={"Select your investment goal"}
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                    required
                />

                <SelectField
                    name={"riskTolerance"}
                    label={"Risk Tolerance"}
                    placeholder={"Select your risk level"}
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                    required
                />

                <SelectField
                    name={"preferredIndustry"}
                    label={"Preferred Industry"}
                    placeholder={"Select your preferred industry"}
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.preferredIndustry}
                    required
                />

                <Button type={"submit"} disabled={isSubmitting} className={"yellow-btn w-full mt-5"}>
                    {isSubmitting ? "Creating account" : "Start your investing journey"}
                </Button>

                <FooterLink text={"Already have an account "} linkText={"Sign in"} href={"/sign-in"} />
            </form>
        </>
    )
}
export default SignUp