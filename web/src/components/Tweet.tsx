import { CheckCircleTwoTone } from "@ant-design/icons";
import Image from 'next/image';

interface TweetProps {
  tweet: string;
  date: string;
  firstName: string;
  lastName: string;
  username: string;
}

const Tweet = (props: TweetProps) => {
  return <>
    <div className="flex gap-2 bg-white p-3 hover:bg-gray-50 border-t border-gray-125">
      <div className="min-w-10 min-h-10 w-10 h-10 rounded-full flex-shrink-0">
       <Image
          src='/images/Rect_NonID_Grey.png'
          alt="X profile image"
          width={40}
          height={40}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col text-[15px] w-full max-w-[600px] break-words gap-[2px] sm:text-[15px] text-[13px]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2 gap-1">
          <h3 className="font-semibold">{`${props.firstName} ${props.lastName}`}</h3>
          <CheckCircleTwoTone twoToneColor="#1DA1F2" />
          <div className="flex gap-1 text-gray-500">
            <p className="m-0 p-0">{props.username}</p>
            <span>·</span>
            <p className="m-0 p-0">
              {new Date(props.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </p>
          </div>
        </div>
        <p className="text-gray-900 p-0">{props.tweet}</p>
      </div>
    </div>
  </>
}

export default Tweet;