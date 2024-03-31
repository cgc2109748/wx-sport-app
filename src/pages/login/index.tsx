import {useEffect, useState} from "react";
import {AtForm, AtInput, AtButton} from "taro-ui";
import {View, Text} from "@tarojs/components";
import {useLoad, navigateTo} from "@tarojs/taro";
import "./index.scss";

type LoginFormProps = {
	userName: string;
	password: string
}

const Login = () => {
	const [formData, setFormData] = useState<LoginFormProps>({
		userName: '',
		password: ''
	})


	useLoad(() => {
		console.log("Page loaded.");
	});

	const submit = async (values: LoginFormProps) => {
		console.log("-> values", values);
		setFormData(values)
		navigateTo({
			url: '/pages/index/index'
		})
	}

	// const reset = () => {
	// 	setFormData({
	// 		userName: '',
	// 		password: ''
	// 	})
	// }


	return (
		<View className='login-container'>
			<Text className='login-title'>校园运动打卡</Text>
			<AtForm
				// @ts-ignore
				onSubmit={submit}
				// onReset={reset}
			>
				<View className='input-wrapper'>
					<AtInput
						name='username'
						title='账号'
						type='text'
						placeholder='账号'
						// value={username}
						// onChange={this.handleChange.bind(this, 'value')}
					/>
					<AtInput
						name='password'
						title='密码'
						type='password'
						placeholder='密码'
						// value={username}
						// onChange={this.handleChange.bind(this, 'value')}
					/>
				</View>
				<AtButton type='primary' formType='submit'>登录</AtButton>
				{/*<AtButton formType='reset' style={{marginTop: '8px'}}>重置</AtButton>*/}
			</AtForm>
		</View>
	);
}

export default Login
