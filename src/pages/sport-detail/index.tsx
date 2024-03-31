import {useEffect, useState} from "react";
import {View, ScrollView, Image, Text} from "@tarojs/components";
import {request, useRouter} from "@tarojs/taro";
import _ from 'lodash'
import './index.scss'

const SportDetail = () => {
	const router = useRouter()
	const [data, setData] = useState<any>({})

	useEffect(() => {
		console.log('router:', router)
		if (!_.isEmpty(router?.params?.id)) {
			fetchData(router.params.id as string)
		}
	}, [router]);

	const fetchData =  (id: string) => {
		console.log("-> id", id);
		request({
			method: 'GET',
			url: `${process.env.TARO_APP_BASE_URL}/sport`,
			data: {
				sportId: id
			},
			success: (res: any) => {
				console.log('res:', res)
				// console.log('res:', res.data?.image.replaceAll('\\', '/'))
				res.data.image = res.data?.image.replaceAll('\\', '/')
				if (res.data) {
					setData(res.data)
				}
			}
		})
	}

	return (
		<View className="container sport-detail">
			<ScrollView scrollY scrollWithAnimation showScrollbar={false} >
				<View className="sport-detail-wrapper">
					<Text className='title'>{data.title}</Text>
					<Image mode='aspectFill' src={data?.image} />
					<Text className='content'>{data.content}</Text>
				</View>
			</ScrollView>
		</View>
	)
}
export default SportDetail
