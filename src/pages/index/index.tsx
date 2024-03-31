import _ from 'lodash'
import {useEffect, useState} from 'react'
import {View, Text, Image, ScrollView} from '@tarojs/components'
import {AtTag, AtCard, AtTabBar, AtToast} from 'taro-ui'
import {getStorage, navigateTo, redirectTo, getUserInfo, request} from "@tarojs/taro";
import {tabList} from "../../utils";

// import "taro-ui/dist/style/components/button.scss" // 按需引入
import './index.scss'

const Index = () => {
	const [listData, setListData] = useState<any[]>([])
	const [userInfo, setUserInfo] = useState<any>()
	const [showToast, setShowToast] = useState<boolean>(false)
	const [toastText, setToastText] = useState<string>('')

	useEffect(() => {
		fetchData()
		getStorage({
			key: "userInfo",
			success: (res: any) => {
				console.log("userInfo:", res.data);
				setUserInfo(res.data)
			},
			fail: (err: any) => {
				console.error(err)
			},
		});
	}, [])

	useEffect(() => {
		console.log('userInfo:', userInfo)
	}, [userInfo])

	const routerHandler = (index: number) => {
		redirectTo({
			url: tabList[index]['path']
		})
	}

	const routeToSportDetail = (id: string) => {
		navigateTo({
			url: `/pages/sport-detail/index?id=${id}`,

		})
	}

	const fetchData = () => {
		request({
			method: 'GET',
			url: `${process.env.TARO_APP_BASE_URL}/sport/list`,
			data: {
				page: 1,
				pageSize: 1000
			},
			success: async (res: any) => {
				console.log('res: ', res)
				if (res.data) {
					// 过滤出状态为 'pass' 的数据
					const filteredData = res.data.results.filter(item => item.status === 'pass');
					setListData(filteredData);
				}
			},
			fail: async (error: any) => {
				console.error(error)
			}
		})
	}

	const closeToast = () => {
		setTimeout(() => {
			setShowToast(false)
		}, 3000)
	}

	const signIn = () => {
		if (_.isEmpty(userInfo)) {
			setToastText('尚未登录，请登录后再签到！')
			setShowToast(true)
			closeToast()
		} else {
			request({
				method: 'POST',
				url: `${process.env.TARO_APP_BASE_URL}/user/signIn`,
				data: {
					openid: userInfo.openid
				},
				success: (res: any) => {
					if (res.data.message) {
						setToastText(res.data.message)
					} else if (res.data.error) {
						setToastText(res.data.error)
					}
					setShowToast(true)
					closeToast()
				},
				fail: () => {
					setToastText('签到失败！')
					setShowToast(true)
					closeToast()
				}
			})
		}
	}

	return (
		<View className='container'>
			<AtToast isOpened={showToast} text={toastText} hasMask={true} duration={3000}/>
			<ScrollView className='scrollview' scrollY scrollWithAnimation>
				<View className='home'>
					<View className='home-banner'/>
					<View className='home-sign-btn' onClick={signIn}>签到</View>
					<View className='card-list'>
						{
							listData.map((item: any) => {
								return (
									<View className='sport' key={item?.id} onClick={() => routeToSportDetail(item.id)}>
										<View className='card-list'>
											<AtCard className='card' title={item?.title}>
												<View className='card-wrapper'>
													<View className="img-wrapper">
														<Image
															mode='aspectFill'
															src={item?.image.replaceAll('\\', '/')}
															// className='card-img'
															lazyLoad={true}
															style={{
																width: '100px',
																height: '100px',
																borderRadius: '8px'
															}}
														/>
													</View>
													<View className='card-content'>
														<View className='card-text'>
															{item?.content}
														</View>
														<View className='card-tags'>
															<AtTag type='primary' size='small' active
																   circle>{item?.tags}</AtTag>
															{/*<AtTag type='primary' size='small' active circle>起步</AtTag>*/}
														</View>
													</View>
												</View>
											</AtCard>
										</View>
									</View>
								)
							})
						}
					</View>
				</View>
			</ScrollView>
			<AtTabBar
				fixed
				tabList={tabList}
				onClick={routerHandler}
				current={0}
			/>
		</View>
	)
}

export default Index
