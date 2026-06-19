/**
 * ImeInput / ImeTextarea
 *
 * 同时解决两类问题：
 * 1. 中文/日文/韩文 IME 合字被 React 受控输入打断
 * 2. 英文/数字输入时光标跳位（useEffect 触发额外重渲染导致）
 *
 * 策略：
 * - 非合字状态（英文、数字）：value 直接来自 prop，走标准受控流程，零副作用
 * - 合字进行中：切换到本地 composingValue state，暂不同步父组件
 * - 合字完成：一次性将最终汉字传给父组件 onChange
 *
 * 双标志设计：
 * - composingRef (useRef)  — 在事件处理器中同步判断，不触发重渲染
 * - isComposing (useState) — 控制 value 来源切换，触发重渲染
 */
import { useRef, useState } from 'react';

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ImeInput({ value, onChange, ...rest }: InputProps) {
  const composingRef = useRef(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composingValue, setComposingValue] = useState('');

  return (
    <input
      {...rest}
      // 合字期间显示本地 state（拼音中间态），否则直接用 prop（英文/数字无额外渲染）
      value={isComposing ? composingValue : ((value as string) ?? '')}
      onChange={e => {
        if (composingRef.current) {
          // 合字进行中：只更新本地显示，不通知父组件
          setComposingValue(e.target.value);
        } else {
          // 正常输入（英文/数字）：直接透传，父组件驱动
          onChange?.(e);
        }
      }}
      onCompositionStart={e => {
        composingRef.current = true;
        setIsComposing(true);
        setComposingValue((e.currentTarget as HTMLInputElement).value);
      }}
      onCompositionEnd={e => {
        composingRef.current = false;
        setIsComposing(false);
        const target = e.currentTarget as HTMLInputElement;
        // 合字完成，将最终汉字一次性同步给父组件
        onChange?.({ target, currentTarget: target } as React.ChangeEvent<HTMLInputElement>);
      }}
    />
  );
}

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function ImeTextarea({ value, onChange, ...rest }: TextareaProps) {
  const composingRef = useRef(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composingValue, setComposingValue] = useState('');

  return (
    <textarea
      {...rest}
      value={isComposing ? composingValue : ((value as string) ?? '')}
      onChange={e => {
        if (composingRef.current) {
          setComposingValue(e.target.value);
        } else {
          onChange?.(e);
        }
      }}
      onCompositionStart={e => {
        composingRef.current = true;
        setIsComposing(true);
        setComposingValue((e.currentTarget as HTMLTextAreaElement).value);
      }}
      onCompositionEnd={e => {
        composingRef.current = false;
        setIsComposing(false);
        const target = e.currentTarget as HTMLTextAreaElement;
        onChange?.({ target, currentTarget: target } as React.ChangeEvent<HTMLTextAreaElement>);
      }}
    />
  );
}
