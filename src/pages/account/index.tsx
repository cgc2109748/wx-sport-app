import {useEffect, useState} from 'react'
import {View , ScrollView, Text} from '@tarojs/components'
import {AtAvatar, AtTabBar, AtButton, AtList, AtListItem, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import {getStorage, getSystemInfoSync, redirectTo, login, request, getUserProfile, setStorage} from "@tarojs/taro";
import {tabList} from "../../utils";
import _ from 'lodash'

// import "taro-ui/dist/style/components/button.scss" // 按需引入
import './index.scss'
import dayjs from "dayjs";

const Sport = () => {
	const [userInfo, setUserInfo] = useState<any>()
	const [systemInfo, setSystemInfo] = useState<any>()
	const [sysOpened, setSysOpened] = useState<boolean>(false)
	const [aboutOpened, setAboutOpened] = useState<boolean>(false)


	useEffect(() => {
		console.log('userInfo:', userInfo)
		console.log('systemInfo:', systemInfo)
	}, [userInfo, systemInfo]);


	useEffect(() => {
		getStorage({
			key:'userInfo',
			success: (res) => {
				if (res.data) {
					setUserInfo(res.data)
				}
			}
		})
		const sys = getSystemInfoSync()
		setSystemInfo(sys)
	}, []);


	const routerHandler = (index: number) => {
		redirectTo({
			url: tabList[index]['path']
		})
	}

	const doLogin = async () => {

		await getUserProfile({
			desc: '用于完善会员信息',
			success: async (ret: any) => {
				await login({
					success: (res: any) => {
						if (res.code) {
							// console.log('code:', res.code)
							request({
								method: 'GET',
								data: {
									appid: 'wx0e882c95b6e81b99',
									secret: '8bb6ec31ba18b085276f1a2ac8f80c0d',
									js_code: res.code,
									grant_type: 'authorization_code'
								},
								url: `https://api.weixin.qq.com/sns/jscode2session`,
								success: (result: any) => {
									console.log('result: ', result)
									if (result.data.openid) {
										// console.log('用户信息res：：', ret)
										// console.log('用户信息：：', ret.userInfo)
										// console.log('请求参数：：', {openid: result.data.openid, ...ret.userInfo})
										request({
											method: 'POST',
											url: `${process.env.TARO_APP_BASE_URL}/user/save`,
											data: {openid: result.data.openid, ...ret.userInfo},
											success: async (res: any) => {
												console.log('res:', res.data)
												let _userInfo = {
													...ret.userInfo,
													...{
														openid: result.data.openid,
														session_key: result.data.session_key,
														iv: ret.iv
													}
												}

												await fetchUserData(result.data.openid, _userInfo)
											}
										})

										console.log('userInfo res:', ret.userInfo)
									}
								}
							})
						}
					}
				})
			}
		})
	}

	const fetchUserData = async (openid: string, info: any) => {
		request({
			method: 'GET',
			url: `${process.env.TARO_APP_BASE_URL}/user/get`,
			data: {
				openid
			},
			success: async (res: any) => {
				console.log('fetchUserData res: ', res)
				let temp: any = _.cloneDeep(info)
				temp['integral'] = res.data?.integral
				await setStorage({
					key: 'userInfo',
					data: temp
				})

				setUserInfo(temp)
			},
			fail: async (error: any) => {
				console.error(error)
			}
		})
	}

	return (
		<View className='container'>
			<ScrollView className='scrollview' scrollY scrollWithAnimation>
				<View className='account'>
					<View className='home-banner'/>
					<AtAvatar size='large' circle image={userInfo?.avatarUrl} />
					<View>{userInfo?.nickName || '未登录'}</View>
					{/*<View className='home-sign-btn'>*/}
					{/*</View>*/}
				</View>
				<View className="sport-info">
					<View className="at-grid">
						<View className="at-grid__flex">
							<View className="at-grid__flex-item at-grid-item at-grid-item--rect" style={{flex: '0 0 50%'}}>
								<View className="at-grid-item__content">
									<View className="at-grid-item__content-inner left">
										<View className="at-grid-item__content-inner__top">0</View>
										<View className="at-grid-item__content-inner__bottom">运动时长</View>
									</View>
								</View>
							</View>
							<View className="at-grid__flex-item at-grid-item at-grid-item--rect" style={{flex: '0 0 50%'}}>
								<View className="at-grid-item__content">
									<View className="at-grid-item__content-inner right">
										<View className="at-grid-item__content-inner__top">{userInfo?.integral || 0}</View>
										<View className="at-grid-item__content-inner__bottom">运动积分</View>
									</View>
								</View>
							</View>
						</View>
					</View>
				</View>
				<View className="account-actions">
					<AtList>
						<AtListItem
							title='关于'
							iconInfo={{ size: 25, color: '#13C2C2', value: 'help', }}
							onClick={() => setAboutOpened(true)}
						/>
						<AtListItem
							title='系统信息'
							iconInfo={{ size: 25, color: '#1677ff', value: 'bell', }}
							onClick={() => setSysOpened(true)}
						/>
						<AtListItem
							title='支持赞赏'
							iconInfo={{ size: 25, color: '#FADB14', value: 'money', }}
							disabled
						/>
						<AtListItem
							title='意见反馈'
							iconInfo={{ size: 25, color: '#722ED1', value: 'edit', }}
							disabled
						/>
					</AtList>
				</View>
				{
					_.isEmpty(userInfo) &&
					<View className="account-actions" style={{marginBottom: '2rem'}}>
						<AtListItem
							title='登录'
							iconInfo={{ size: 25, color: '#FF4949', value: 'lock', }}
							onClick={doLogin}
						/>
					</View>
				}
				{/*<AtButton type='primary' onClick={doLogin}>登录</AtButton>*/}
			</ScrollView>
			<AtTabBar
				fixed
				tabList={tabList}
				onClick={routerHandler}
				current={3}
			/>
			<AtModal isOpened={aboutOpened} onClose={() => setAboutOpened(false)}>
				<AtModalHeader>
					关于
				</AtModalHeader>
				<AtModalContent>
					<View className='about-modal'>
						<Text>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;我们致力于提供一个温馨、人性化的运动打卡平台。我们相信，每个人都值得拥有健康和活力，因此我们为您提供个性化的运动计划，鼓励您在忙碌的学习生活中，找到属于自己的运动时光。</Text>
						<Text>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在这里，您可以发布运动项目邀请大伙共同参与，通过每日打卡记录您的运动成果。我们鼓励您分享您的运动故事，与校园内的小伙伴们互相激励、共同进步。我们相信，通过坚持和努力，您不仅能够提升身体健康，还能收获更多的快乐和自信。
						</Text>
						<Text>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;让我们一起开始这段美好的运动旅程吧！
						</Text>
					</View>
				</AtModalContent>
			</AtModal>
			{!_.isEmpty(systemInfo) && <AtModal isOpened={sysOpened} onClose={() => setSysOpened(false)}>
				<AtModalHeader>
					系统信息
				</AtModalHeader>
				<AtModalContent>
					<View className='sys-modal'>
						<Text>
							{`设备品牌：${systemInfo.brand}`}
						</Text>
						<Text>
							{`设备型号：${systemInfo.model}`}
						</Text>
						<Text>
							{`微信版本号：${systemInfo.version}`}
						</Text>
						<Text>
							{`操作系统版本：${systemInfo.system}`}
						</Text>
					</View>
				</AtModalContent>
			</AtModal>}
		</View>
	)
}

export default Sport
