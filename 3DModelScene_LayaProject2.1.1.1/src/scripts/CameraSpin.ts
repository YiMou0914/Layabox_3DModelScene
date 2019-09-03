import GameMgr from "./GameMgr";
import Mathf from "./utils/Mathf";

export default class CameraSpin extends Laya.Script3D {

    constructor() { super(); }

    private cameraNode: Laya.Camera;
    public target: Laya.Sprite3D;
    public get targetPos(): Laya.Vector3 {
        return this.target.transform.position;
    }

    /**是引用类型 改变pos vector3也会改变 */
    private _cameraPos: Laya.Vector3;
    public get cameraPos(): Laya.Vector3 {
        if (this._cameraPos == null) {
            this._cameraPos = this.cameraNode.transform.position;
        }
        return this._cameraPos;
    }
    public set cameraPos(v: Laya.Vector3) {
        this.cameraNode.transform.position = v;
    }

    private _cameraRot: Laya.Quaternion;
    public get cameraRot(): Laya.Quaternion {
        if (this._cameraRot == null) {
            this._cameraRot = this.cameraNode.transform.rotation;
        }
        return this._cameraRot;
    }
    public set cameraRot(v: Laya.Quaternion) {
        this.cameraNode.transform.rotation = v;
    }


    private _camViewTargetPos: Laya.Vector3;
    public get camViewTargetPos(): Laya.Vector3 {
        if (this._camViewTargetPos == null) {
            this._camViewTargetPos = this.targetPos;
        }
        return this._camViewTargetPos;
    }
    public set camViewTargetPos(v: Laya.Vector3) {
        this._camViewTargetPos = v;
    }

    public G_fZoomSpeed: number = -16; //缩放值
    private distance: number = 5;
    public minDistance: number = 0.6;
    public maxDistance: number = 20;
    /**设置旋转角度 */
    private x: number = 0;
    private y: number = 0;
    private z: number = 0;
    /**y轴角度限制，设置成一样则该轴不旋转 */
    public yMinLimit: number = -90;
    public yMaxLimit: number = 90;

    /**x轴角度限制，同上 */
    public leftMax: number = -365;
    public rightMax: number = 365;

    /**旋转速度值 */
    public xSpeed: number = 5;
    public ySpeed: number = 5;

    private rotation: Laya.Quaternion = new Laya.Quaternion();
    private position: Laya.Vector3 = new Laya.Vector3();

    private curTouchCount: number = 0;
    private isNeedAdjust: boolean;
    private oldTouch0: Laya.Vector3;
    private oldTouch1: Laya.Vector3;
    private newTouch0: Laya.Vector3;
    private newTouch1: Laya.Vector3;

    onStart(): void {
        console.log(GameMgr.instance.scene3D);
        this.cameraNode = GameMgr.instance.scene3D.getChildByName("Main Camera") as Laya.Camera;
        this.target = GameMgr.instance.scene3D.getChildByName("00anganzhafa") as Laya.Sprite3D;

        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.handleMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.handleMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_WHEEL, this, this.handleMouseWheel);

        this.SetCamPoint(this.cameraPos);
    }

    /**设置摄像机的点位 */
    SetCamPoint(pos: Laya.Vector3) {
        this.cameraPos = pos;
        //this.cameraNode.transform.lookAt(this.camViewTargetPos, this.VEC_UP); 
        var qua = Mathf.GetToTargetRotation(Mathf.Vec_Sub(this.camViewTargetPos, this.cameraPos)); 
        this.cameraRot = qua;

        this.AdjustValue();
    }

    /**
     * 调整xyz,position,rotation,distance
     */
    AdjustValue(): void {
        this.distance = Laya.Vector3.distance(this.camViewTargetPos, this.cameraPos);
        console.log("重置distance:" + this.distance);
        this.position = this.cameraPos;
        this.rotation = this.cameraRot;
        this.x = Mathf.QuaToVec(this.cameraRot).x;
        this.y = Mathf.QuaToVec(this.cameraRot).y;
        this.z = Mathf.QuaToVec(this.cameraRot).z;
        console.log("调整后Camera的rotation:" + this.cameraNode.transform.rotationEuler.x + " " + this.cameraNode.transform.rotationEuler.y + " " + this.cameraNode.transform.rotationEuler.z);
    }

    handleMouseDown(event: Laya.Event): void {
        var arr: Array<any> = event.touches;

        if (arr == undefined) {
            arr = new Array();
            arr[0] = event;
        }
        this.curTouchCount = arr.length;

        this.oldTouch0 = new Laya.Vector3(arr[0].stageX, arr[0].stageY, 0);
        if (this.curTouchCount == 2) {
            this.oldTouch1 = new Laya.Vector3(arr[1].stageX, arr[1].stageY, 0);
        }
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.handleMouseMove);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.handleMouseUp);
    }

    handleMouseMove(event: Laya.Event): void {
        var arr: Array<any> = event.touches;

        if (arr == undefined) {
            arr = new Array();
            arr[0] = event;
        }

        if (arr.length == 2) {
            this.curTouchCount = 2;
        }
        if (this.curTouchCount == 1) {
            this.onTouchOne(arr[0]);
        }
        else if (this.curTouchCount == 2) {
            this.onTouchTwo(event);
        }
    }

    onTouchOne(event: Laya.Event) {
        if (this.isNeedAdjust == true) {
            this.AdjustValue();
            this.isNeedAdjust = false;
        }

        this.newTouch0 = new Laya.Vector3(event.stageX, event.stageY, 0);
        var dir = Mathf.Vec_Sub(this.newTouch0, this.oldTouch0);

        this.x += dir.y * this.xSpeed * -0.05;
        this.y += dir.x * this.ySpeed * -0.05;
        this.distance = Mathf.Clamp(this.distance, this.minDistance, this.maxDistance);

        this.x = Mathf.Clamp(this.x, -90, 90);

        this.rotation = Mathf.VecToQua(new Laya.Vector3(this.x, this.y, this.z));
        this.position = Mathf.Vec_Add(Mathf.VecDotQua(new Laya.Vector3(0, 0, this.distance), this.rotation), this.camViewTargetPos);

        this.cameraPos = this.position;
        this.cameraRot = this.rotation;
        this.oldTouch0 = this.newTouch0;

        //console.log("eluer:" + this.cameraNode.transform.rotationEuler.x + " " + this.cameraNode.transform.rotationEuler.y + " " + this.cameraNode.transform.rotationEuler.z);
    }

    /**处理双指触控 */
    onTouchTwo(event: Laya.Event): void {
        var arr: Laya.Event[] = event.touches;

        if (arr == undefined && arr.length != 2) {
            return;
        }

        this.newTouch0 = new Laya.Vector3(arr[0].stageX, arr[0].stageY, 0);
        this.newTouch1 = new Laya.Vector3(arr[1].stageX, arr[1].stageY, 0);

        var oldDistance = Laya.Vector3.distance(this.oldTouch0, this.oldTouch1);
        var newDistance = Laya.Vector3.distance(this.newTouch0, this.newTouch1);
        var offset = newDistance - oldDistance;

        this.HorVerMoveByTouch(arr);
        this.processToFarAndNear(offset / 30);

        this.oldTouch0 = this.newTouch0;
        this.oldTouch1 = this.newTouch1;
    }

    /* 处理上下左右平移移动视角（触屏）*/
    HorVerMoveByTouch(arr: Laya.Event[]) {
        var point1 = Mathf.Vec_Mul(Mathf.Vec_Add(this.newTouch0, this.newTouch1), 0.5);
        var point2 = Mathf.Vec_Mul(Mathf.Vec_Add(this.oldTouch0, this.oldTouch1), 0.5);
        var dirVec2 = Mathf.Vec_Mul(Mathf.Vec_Sub(point1, point2), 0.0025);

        if (Laya.Vector3.scalarLength(dirVec2) > 0.005) {
            var temp = Mathf.VecDotQua(new Laya.Vector3(-dirVec2.x, dirVec2.y, 0), this.cameraRot);

            this.cameraPos = Mathf.Vec_Add(this.cameraPos, temp);
            this.camViewTargetPos = Mathf.Vec_Add(this.camViewTargetPos, temp);

            this.isNeedAdjust = true;
        }
    }


    handleMouseUp(event: Laya.Event): void {
        console.log(event.type);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.handleMouseMove);
        Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.handleMouseUp);
        this.AdjustValue();
    }


    handleMouseWheel(event: Laya.Event): void {
        var scaleFactor = event.delta;
        this.processToFarAndNear(scaleFactor);
    }


    processToFarAndNear(scaleFactor: number) {
        console.log("scaleFactor:" + scaleFactor);

        if (Math.abs(scaleFactor) > 0.02) {
            var nexPos = Mathf.Vec_Add(this.cameraPos, Mathf.Vec_Mul(Mathf.Vec_Normalize(Mathf.Vec_Sub(this.cameraPos, this.camViewTargetPos)), scaleFactor * this.G_fZoomSpeed * 0.01));
            var nearPos = Mathf.Vec_Sub(this.camViewTargetPos, Mathf.Vec_Mul(Mathf.Vec_Normalize(Mathf.Vec_Sub(this.camViewTargetPos, this.cameraPos)), this.minDistance));
            var farPos = Mathf.Vec_Sub(this.camViewTargetPos, Mathf.Vec_Mul(Mathf.Vec_Normalize(Mathf.Vec_Sub(this.camViewTargetPos, this.cameraPos)), this.maxDistance));

            nexPos.x = nearPos.x < farPos.x ? Mathf.Clamp(nexPos.x, nearPos.x, farPos.x) : Mathf.Clamp(nexPos.x, farPos.x, nearPos.x);
            nexPos.y = nearPos.y < farPos.y ? Mathf.Clamp(nexPos.y, nearPos.y, farPos.y) : Mathf.Clamp(nexPos.y, farPos.y, nearPos.y);
            nexPos.z = nearPos.z < farPos.z ? Mathf.Clamp(nexPos.z, nearPos.z, farPos.z) : Mathf.Clamp(nexPos.z, farPos.z, nearPos.z);

            this.cameraPos = nexPos;
            this.isNeedAdjust = true;
        }
    }


   
}