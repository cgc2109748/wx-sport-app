import {useEffect, useState} from 'react'
import {Text, View, Image, ScrollView} from '@tarojs/components'
import {AtTag, AtCard, AtTabBar, AtFab} from 'taro-ui'
import {getStorage, navigateTo, redirectTo, request} from "@tarojs/taro";
import {tabList} from "../../utils";

import './index.scss'

const Sport = () => {
	const [listData, setListData] = useState<any[]>([])
	const [pageSize, setPageSize] = useState<number>(1000)
	const [isLogin, setIsLogin] = useState<boolean>(false)

	useEffect(() => {
		fetchData()
		getStorage({
			key: 'userInfo',
			success: (res: any) => {
				console.log("-> res", res);
				if (res.data) {
					setIsLogin(true)
				}
			},
			fail: (err: any) => {
				console.error(err)
			}
		})
	}, []);


	const fetchData = () => {
		request({
			method: 'GET',
			url: `${process.env.TARO_APP_BASE_URL}/sport/list`,
			data: {
				page: 1,
				pageSize
			},
			success: async (res: any) => {
				console.log('res: ', res)
				if (res.data) {
					const filteredData = res.data.results.filter(item => item.status === 'pass');
					setListData(filteredData)
				}
			},
			fail: async (error: any) => {
				console.error(error)
			}
		})
	}

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

	return (
		<View className='container'>
			{isLogin && <View className='add-fab-btn'>
				<AtFab onClick={() => navigateTo({
					url: '/pages/sport-edit/index'
				})}><Text className='at-fab__icon at-icon at-icon-add'/></AtFab>
			</View>}
			<ScrollView className='scroll-wrapper' scrollY scrollWithAnimation showScrollbar={false} onScrollToLower={() => {
				setPageSize(pageSize + 10)
				fetchData()
			}}>
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
													style={{width: '100px', height: '100px', borderRadius: '8px'}}
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
			</ScrollView>
			<AtTabBar
				fixed
				tabList={tabList}
				onClick={routerHandler}
				current={1}
			/>
		</View>
	)
}

export default Sport
