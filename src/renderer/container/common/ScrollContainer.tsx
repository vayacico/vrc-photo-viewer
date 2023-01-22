import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Scroller from '../../component/common/Scroller';
import { State } from '../../reducers';

interface Props {
  height: number;
  viewedItemIndex: number;
  dataIndexList: { date: Date; index: number }[];
  scrollToIndex: (targetIndex: number) => void;
}

const TOP_MARGIN = 16;
const BOTTOM_MARGIN = 16;

const ScrollContainer: React.FC<Props> = (props) => {
  const [targetPosition, setTargetPosition] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [labelText, setLabelText] = useState('');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [scrollbarPosition, setScrollbarPosition] = useState(0);

  const scrollbarRef = useRef<HTMLDivElement>(null);
  const pageMode = useSelector((state: State) => state.pageMode.current.mode);

  useEffect(() => {
    if (
      scrollbarRef.current &&
      scrollbarRef.current.getBoundingClientRect().y !== 0
    ) {
      setScrollbarPosition(scrollbarRef.current.getBoundingClientRect().y);
    }
  }, [pageMode, showTarget]);

  /**
   * ウインドウ座標系からタイトルバー座標系への変換(px)
   * @param clientY
   */
  const clientCoordinateToScrollBarCoordinate = (clientY: number) => {
    // タイトルバーのY座標とスクロールバーの上部マージン(16)を引く
    return clientY - scrollbarPosition - TOP_MARGIN;
  };
  // 表示領域の高さからマージを引いてスクロールバーの高さを計算する
  const scrollBarHeight = props.height - TOP_MARGIN - BOTTOM_MARGIN;

  /**
   * スクロールバー上でマウスが動いたときにのハンドラ
   * @param e
   */
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // タイトルバー座標系でのY座標を計算
    const positionYInScrollBar = clientCoordinateToScrollBarCoordinate(
      e.clientY
    );
    // 範囲外なら判定を外して終了
    if (positionYInScrollBar < 0 || scrollBarHeight < positionYInScrollBar) {
      setShowTarget(false);
      return;
    }
    setShowTarget(true);

    // ターゲットポイントのポジションをセット
    setTargetPosition(positionYInScrollBar);
    // 表示するラベルを計算してセット
    const index = Math.floor(
      (positionYInScrollBar / scrollBarHeight) *
        (props.dataIndexList.length - 1)
    );
    setLabelText(props.dataIndexList[index].date.toLocaleDateString());

    // 押下状態でマウスが動いているときは該当箇所へスクロールする
    if (isMouseDown) {
      props.scrollToIndex(props.dataIndexList[index].index);
    }
  };

  /**
   * 領域内でマウスがプレスされたときのハンドラ(押されたされた瞬間だけ薄荷する)
   * @param e
   */
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsMouseDown(true);
    // タイトルバー内でのY座標を計算
    const positionYInScrollBar = clientCoordinateToScrollBarCoordinate(
      e.clientY
    );
    // 範囲外なら何もしない
    if (positionYInScrollBar < 0 || scrollBarHeight < positionYInScrollBar) {
      return;
    }
    // ポイントのポジションをセット
    setTargetPosition(positionYInScrollBar);
    // ラベルテキストのセット
    const index = Math.floor(
      (positionYInScrollBar / scrollBarHeight) *
        (props.dataIndexList.length - 1)
    );
    // 該当箇所へスクロールする
    props.scrollToIndex(props.dataIndexList[index].index);
  };

  /**
   * マウスがクリックから戻った時のハンドラ
   */
  const onMouseUp = () => {
    setIsMouseDown(false);
  };

  /**
   * マウスが領域を離れた時のハンドラ
   */
  const onMouseLeave = () => {
    setIsMouseDown(false);
    setShowTarget(false);
  };

  /**
   * マウスが領域に入った時のハンドラ
   * @param e
   */
  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // タイトルバー内でのY座標を計算
    const positionYInScrollBar = clientCoordinateToScrollBarCoordinate(
      e.clientY
    );
    // 範囲外なら判定を外して終了
    if (positionYInScrollBar < 0 || scrollBarHeight < positionYInScrollBar) {
      setShowTarget(false);
      return;
    }
    setShowTarget(true);
  };

  /**
   * 表示箇所が変わった時に現在地のポイントを更新する
   */
  useEffect(() => {
    // 表示されている行のインデックスからスクロールバー上の位置を計算
    setCurrentPosition(
      (props.viewedItemIndex / props.dataIndexList.length) * scrollBarHeight
    );
  }, [props.dataIndexList.length, props.viewedItemIndex, scrollBarHeight]);

  if (props.dataIndexList.length === 0) {
    return null;
  }

  return (
    <Scroller
      scrollbarRef={scrollbarRef}
      scrollbarHeight={props.height}
      targetPosition={targetPosition}
      currentPosition={currentPosition}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      labelText={labelText}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      targetVisibly={showTarget}
    />
  );
};
export default ScrollContainer;
